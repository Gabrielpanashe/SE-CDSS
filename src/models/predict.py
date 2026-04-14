"""
Prediction service for SE-CDSS sentiment and risk classification.
Loads trained baseline artifacts and maps predictions to clinical risk labels.
"""

import logging
import os
from typing import Any, Dict, Optional

import joblib

from src import config
from src.preprocessing.text_normalization import clean_text, preprocess_text

LOGGER = logging.getLogger(__name__)

_model: Optional[Any] = None
_vectorizer: Optional[Any] = None


def _load_models() -> None:
    """
    Load model and vectorizer artifacts into memory once.

    Args:
        None.

    Returns:
        None.
    """
    global _model, _vectorizer
    if _model is not None and _vectorizer is not None:
        return
    if not os.path.exists(config.MODEL_PATH):
        raise FileNotFoundError(
            "Baseline model file is missing. Please run training first "
            f"at: {config.MODEL_PATH}"
        )
    if not os.path.exists(config.VECTORIZER_PATH):
        raise FileNotFoundError(
            "TF-IDF vectorizer file is missing. Please run training first "
            f"at: {config.VECTORIZER_PATH}"
        )
    _model = joblib.load(config.MODEL_PATH)
    _vectorizer = joblib.load(config.VECTORIZER_PATH)
    LOGGER.info("Model artifacts loaded successfully.")


def map_risk(sentiment: str, confidence: float) -> str:
    """
    Map sentiment and confidence values to a clinical risk category.

    Args:
        sentiment: Predicted sentiment label.
        confidence: Model confidence score between 0 and 1.

    Returns:
        Clinical risk label string.
    """
    normalized_sentiment = sentiment.upper()
    if normalized_sentiment == "POSITIVE":
        return "Mild Concern"
    if normalized_sentiment == "NEUTRAL":
        if confidence >= config.NEUTRAL_CONFIDENCE_THRESHOLD:
            return "Mild Concern"
        return "Moderate Risk"
    if normalized_sentiment == "NEGATIVE":
        if confidence >= config.NEGATIVE_SEVERE_THRESHOLD:
            return "Severe Adverse Reaction"
        return "Moderate Risk"
    return "Moderate Risk"


def apply_keyword_escalation(review_text: str, current_risk: str) -> str:
    """
    Escalate risk when adverse keywords are present in raw review text.

    Args:
        review_text: Original review text.
        current_risk: Risk level from model-based mapping.

    Returns:
        Possibly escalated risk level.
    """
    lowered = review_text.lower()
    for keyword in config.ADVERSE_KEYWORDS:
        if keyword in lowered:
            return "Severe Adverse Reaction"
    return current_risk


def predict(review_text: str) -> Dict[str, Any]:
    """
    Predict sentiment, confidence, probabilities, and risk for a review.

    Args:
        review_text: Raw patient medication feedback text.

    Returns:
        Prediction payload with sentiment, confidence, risk, cleaned text, probabilities.
    """
    try:
        _load_models()
    except FileNotFoundError as exc:
        LOGGER.error("Model loading failed: %s", exc)
        raise RuntimeError(str(exc)) from exc

    cleaned = clean_text(review_text)
    processed = preprocess_text(cleaned)
    if not processed.strip():
        risk_level = apply_keyword_escalation(review_text or "", "Mild Concern")
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "risk_level": risk_level,
            "cleaned_text": processed,
            "probabilities": {"negative": 0.0, "neutral": 1.0, "positive": 0.0},
        }

    vec = _vectorizer.transform([processed])
    prediction = str(_model.predict(vec)[0]).lower()
    probabilities = _model.predict_proba(vec)[0]
    classes = [str(label).lower() for label in list(_model.classes_)]
    prob_dict = {label: round(float(prob), 4) for label, prob in zip(classes, probabilities)}
    confidence = round(max(float(prob) for prob in probabilities), 4)
    risk_level = map_risk(prediction, confidence)
    risk_level = apply_keyword_escalation(review_text, risk_level)

    return {
        "sentiment": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "cleaned_text": processed,
        "probabilities": prob_dict,
    }