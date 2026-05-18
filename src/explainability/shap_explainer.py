"""
LIME text explainability for the SE-CDSS BioBERT sentiment model.

Replaces the earlier SHAP + TF-IDF baseline approach: LIME is model-agnostic
so it explains the actual BioBERT predictions (H3 evidence), not a proxy model.

LIME perturbs the input text (masks/removes words) and fits a local linear
model to the BioBERT probability outputs, identifying which words most drove
the prediction.

Public API is unchanged — explain() still returns top_positive / top_negative
dicts — so no other file needs to be touched.
"""

import logging
from typing import Dict, List

import numpy as np

LOGGER = logging.getLogger(__name__)


def _biobert_predict_proba(texts: List[str]):
    """
    Wrapper called by LIME: takes a list of perturbed text strings and
    returns an (n_samples, 3) probability matrix [negative, neutral, positive].
    Lazy-imports BioBERT so the explainer only loads it once it is already warm.
    """
    from src.models.predict_bert import predict  # noqa: PLC0415

    result = []
    for text in texts:
        try:
            out = predict(text)
            p = out["probabilities"]
            result.append([p["negative"], p["neutral"], p["positive"]])
        except Exception:
            result.append([1 / 3, 1 / 3, 1 / 3])
    return np.array(result, dtype=float)


def explain(text: str, top_n: int = 5) -> Dict[str, List[str]]:
    """
    Return the top_n words that most supported or introduced uncertainty into
    the BioBERT prediction for *text*.

    Args:
        text:  Raw patient review string.
        top_n: Number of words to return per direction.

    Returns:
        Dict with keys:
            'top_positive'  — words that pushed the predicted class higher
            'top_negative'  — words that pulled confidence down / introduced doubt
    """
    try:
        from lime.lime_text import LimeTextExplainer  # noqa: PLC0415

        # Predict the class for this text so we know which class to explain.
        from src.models.predict_bert import predict as bert_predict  # noqa: PLC0415

        pred = bert_predict(text)
        sentiment = pred["sentiment"]   # 'negative' | 'neutral' | 'positive'
        class_names = ["negative", "neutral", "positive"]
        label_idx = class_names.index(sentiment)

        explainer = LimeTextExplainer(class_names=class_names)
        explanation = explainer.explain_instance(
            text,
            _biobert_predict_proba,
            num_features=top_n * 2,   # ask for extra; we'll split +/–
            labels=[label_idx],
            num_samples=100,          # low enough to be fast on CPU
        )

        word_weights = explanation.as_list(label=label_idx)

        positive_words = [w for w, s in word_weights if s > 0][:top_n]
        negative_words = [w for w, s in word_weights if s < 0][:top_n]

        return {"top_positive": positive_words, "top_negative": negative_words}

    except Exception as exc:
        LOGGER.warning("LIME explanation failed: %s", exc)
        return {"top_positive": [], "top_negative": []}
