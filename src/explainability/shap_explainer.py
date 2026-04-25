"""
SHAP explainability for the TF-IDF + Logistic Regression baseline model.
Returns the top contributing words for a sentiment prediction (H3 evidence).
"""

import logging
from typing import Dict, List, Optional
import joblib
import numpy as np
import shap

from src import config

LOGGER = logging.getLogger(__name__)

_explainer: Optional[shap.LinearExplainer] = None
_vectorizer = None


def _load() -> tuple:
    global _explainer, _vectorizer
    if _explainer is not None:
        return _explainer, _vectorizer

    model = joblib.load(config.MODEL_PATH)
    _vectorizer = joblib.load(config.VECTORIZER_PATH)

    # LinearExplainer works directly with sklearn LR + sparse matrices
    _explainer = shap.LinearExplainer(model, masker=shap.maskers.Independent(data=np.zeros((1, len(_vectorizer.get_feature_names_out())))))
    LOGGER.info("SHAP LinearExplainer ready.")
    return _explainer, _vectorizer


def explain(text: str, top_n: int = 5) -> Dict[str, List[str]]:
    """
    Return the top_n positive and negative SHAP contributors for a review.

    Args:
        text: Raw patient review string.
        top_n: Number of words to return per direction.

    Returns:
        Dict with keys 'top_positive' and 'top_negative', each a list of word strings.
    """
    try:
        explainer, vectorizer = _load()
        vec = vectorizer.transform([text])
        shap_values = explainer.shap_values(vec)

        feature_names = vectorizer.get_feature_names_out()

        # shap_values shape: (n_classes, 1, n_features) or (1, n_features) for binary
        if isinstance(shap_values, list):
            # Multi-class: use the POSITIVE class (index 2 = POSITIVE after label encoding)
            # Labels are sorted alphabetically: NEGATIVE=0, NEUTRAL=1, POSITIVE=2
            values = shap_values[2][0]
        else:
            values = shap_values[0]

        indices = np.argsort(values)
        negative_words = [feature_names[i] for i in indices[:top_n] if values[i] < 0]
        positive_words = [feature_names[i] for i in indices[-top_n:][::-1] if values[i] > 0]

        return {"top_positive": positive_words, "top_negative": negative_words}

    except Exception as exc:
        LOGGER.warning("SHAP explanation failed: %s", exc)
        return {"top_positive": [], "top_negative": []}
