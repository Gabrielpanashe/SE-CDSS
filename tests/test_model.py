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


def test_map_risk_exact_confidence_boundaries() -> None:
    """Verify the exact threshold values: neutral=0.60, negative severe=0.75."""
    # Neutral: exactly at threshold → Mild Concern; just below → Moderate Risk
    assert map_risk("neutral", 0.60) == "Mild Concern"
    assert map_risk("neutral", 0.59) == "Moderate Risk"
    # Negative: exactly at severe threshold → Severe; just below → Moderate Risk
    assert map_risk("negative", 0.75) == "Severe Adverse Reaction"
    assert map_risk("negative", 0.74) == "Moderate Risk"
    # Positive is always Mild Concern regardless of confidence
    assert map_risk("positive", 0.0) == "Mild Concern"
    assert map_risk("positive", 1.0) == "Mild Concern"


@pytest.mark.skipif(
    not os.path.exists(config.MODEL_PATH) or not os.path.exists(config.VECTORIZER_PATH),
    reason="Baseline model artifacts not present",
)
def test_predict_returns_lowercase_sentiment_and_probs() -> None:
    result = predict("The medication helped my symptoms.")
    assert result["sentiment"] in {"positive", "neutral", "negative"}
    assert set(result["probabilities"].keys()) <= {"positive", "neutral", "negative"}
    assert 0.0 <= result["confidence"] <= 1.0
