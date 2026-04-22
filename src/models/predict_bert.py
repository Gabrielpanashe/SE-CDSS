"""
BioBERT inference module for SE-CDSS.

Provides the same predict() interface as predict.py (the baseline module) so
the API can swap between the two models without any changes to route code.
Loads the fine-tuned model from models/biobert_sentiment/ on first call and
caches it in memory for subsequent requests.
"""

import logging
import os
from typing import Any, Dict, Optional

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from src import config
from src.preprocessing.text_normalization import clean_text
from src.models.predict import apply_keyword_escalation, map_risk

LOGGER = logging.getLogger(__name__)

# ── model directory (written by scripts/train_biobert.py) ─────────────────────
BIOBERT_MODEL_DIR: str = os.path.join(config.PROJECT_ROOT, "models", "biobert_sentiment")

# ── label order — must match train_biobert.py ─────────────────────────────────
LABELS: list = ["NEGATIVE", "NEUTRAL", "POSITIVE"]   # index 0, 1, 2

# ── token limit used during training ──────────────────────────────────────────
MAX_LENGTH: int = 128

# ── module-level cache — loaded once, reused on every request ─────────────────
_tokenizer: Optional[Any]  = None
_model:     Optional[Any]  = None
_device:    Optional[torch.device] = None


def _load_model() -> None:
    """
    Load the fine-tuned BioBERT model and tokenizer into memory (once).

    We use a module-level cache (_model, _tokenizer) so the heavy model
    load only happens on the first request.  Subsequent calls are fast.

    Raises:
        FileNotFoundError: If the BioBERT model directory is missing.
            Run scripts/train_biobert.py to create it.

    Returns:
        None.
    """
    global _tokenizer, _model, _device

    if _model is not None and _tokenizer is not None:
        return   # already loaded — nothing to do

    if not os.path.isdir(BIOBERT_MODEL_DIR):
        raise FileNotFoundError(
            f"BioBERT model directory not found at: {BIOBERT_MODEL_DIR}\n"
            "Run 'python scripts/train_biobert.py' to train and save the model first."
        )

    LOGGER.info("Loading BioBERT model from %s...", BIOBERT_MODEL_DIR)
    _device    = torch.device("cpu")
    _tokenizer = AutoTokenizer.from_pretrained(BIOBERT_MODEL_DIR)
    _model     = AutoModelForSequenceClassification.from_pretrained(BIOBERT_MODEL_DIR)
    _model.to(_device)
    _model.eval()
    LOGGER.info("BioBERT model loaded successfully (device=%s).", _device)


def predict(review_text: str) -> Dict[str, Any]:
    """
    Predict sentiment, confidence, probabilities, and clinical risk for a review.

    This function has the exact same signature and return structure as
    src/models/predict.predict() so the API routes can use either model
    without any code changes.

    How it works:
        1. Clean the raw text (strip HTML, lowercase)
        2. Tokenise using the BioBERT tokenizer (subword tokenisation)
        3. Forward pass through the fine-tuned model → logits
        4. Apply softmax to get class probabilities
        5. Pick the highest-probability class as the prediction
        6. Apply the SE-CDSS risk mapping rules (from config.py thresholds)
        7. Apply keyword escalation (safety override)

    Args:
        review_text: Raw patient medication feedback text.

    Returns:
        Dict with keys:
            sentiment    (str)  — 'positive', 'neutral', or 'negative' (always lowercase)
            confidence   (float) — max class probability, 0.0–1.0
            risk_level   (str)  — 'Mild Concern', 'Moderate Risk', or 'Severe Adverse Reaction'
            cleaned_text (str)  — text after clean_text()
            probabilities (dict) — {'negative': float, 'neutral': float, 'positive': float}

    Raises:
        RuntimeError: If the model cannot be loaded.
    """
    try:
        _load_model()
    except FileNotFoundError as exc:
        LOGGER.error("BioBERT model loading failed: %s", exc)
        raise RuntimeError(str(exc)) from exc

    cleaned = clean_text(review_text)

    if not cleaned.strip():
        # empty text after cleaning — return safe defaults
        risk_level = apply_keyword_escalation(review_text or "", "Mild Concern")
        return {
            "sentiment":     "neutral",
            "confidence":    0.0,
            "risk_level":    risk_level,
            "cleaned_text":  cleaned,
            "probabilities": {"negative": 0.0, "neutral": 1.0, "positive": 0.0},
        }

    # tokenise — same parameters used during training
    inputs = _tokenizer(
        cleaned,
        max_length=MAX_LENGTH,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    # forward pass (no gradient needed for inference)
    with torch.no_grad():
        outputs = _model(**inputs)
        logits  = outputs.logits                          # raw scores
        probs   = torch.softmax(logits, dim=-1)[0]       # probabilities sum to 1

    # build probability dict in lowercase keys (API contract)
    prob_dict = {
        label.lower(): round(float(probs[i]), 4)
        for i, label in enumerate(LABELS)
    }

    pred_idx    = int(torch.argmax(probs).item())
    sentiment   = LABELS[pred_idx].lower()               # always lowercase
    confidence  = round(float(probs[pred_idx].item()), 4)

    risk_level = map_risk(sentiment, confidence)
    risk_level = apply_keyword_escalation(review_text, risk_level)

    return {
        "sentiment":     sentiment,
        "confidence":    confidence,
        "risk_level":    risk_level,
        "cleaned_text":  cleaned,
        "probabilities": prob_dict,
    }
