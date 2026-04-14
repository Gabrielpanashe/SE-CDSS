"""
Tests for baseline sentiment prediction (requires trained artifacts locally).
"""

import os

import pytest

from src import config
from src.models.predict import map_risk, predict


def test_map_risk_matches_dissertation_rules() -> None:
    assert map_risk("positive", 0.9) == "Mild Concern"
    assert map_risk("neutral", 0.7) == "Mild Concern"
    assert map_risk("neutral", 0.5) == "Moderate Risk"
    assert map_risk("negative", 0.8) == "Severe Adverse Reaction"
    assert map_risk("negative", 0.5) == "Moderate Risk"


@pytest.mark.skipif(
    not os.path.exists(config.MODEL_PATH) or not os.path.exists(config.VECTORIZER_PATH),
    reason="Baseline model artifacts not present",
)
def test_predict_returns_lowercase_sentiment_and_probs() -> None:
    result = predict("The medication helped my symptoms.")
    assert result["sentiment"] in {"positive", "neutral", "negative"}
    assert set(result["probabilities"].keys()) <= {"positive", "neutral", "negative"}
    assert 0.0 <= result["confidence"] <= 1.0
