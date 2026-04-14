"""
Rank drug options using guideline, simulated EHR, and sentiment components.
"""

import logging
from typing import Any, Dict, List

from src import config
from src.ehr.ehr_loader import get_patient

LOGGER = logging.getLogger(__name__)


def get_recommendations(
    condition: str,
    patient_id: str,
    sentiment: str,
) -> List[Dict[str, Any]]:
    """
    Score each candidate drug and return the top three recommendations.

    Score = (w1 x GuidelineScore) + (w2 x EHRScore) + (w3 x SentimentScore)

    Args:
        condition: Target condition key (e.g. hypertension).
        patient_id: Simulated patient identifier.
        sentiment: Latest sentiment label: positive, neutral, or negative.

    Returns:
        Up to three dicts with drug, guideline_score, ehr_score, sentiment_score,
        and recommendation_score.

    Raises:
        ValueError: Unknown condition or sentiment, or patient/condition mismatch.
        KeyError: Propagated from EHR loader when patient_id is unknown.
    """
    cond = condition.strip().lower()
    sent = sentiment.strip().lower()

    if cond not in config.DRUG_MAP:
        raise ValueError(f"Unknown condition: {condition!r}")
    if sent not in config.SENTIMENT_SCORE_MAP:
        raise ValueError(f"Unknown sentiment: {sentiment!r}")

    patient = get_patient(patient_id.strip())
    patient_condition = str(patient.get("condition", "")).strip().lower()
    if patient_condition != cond:
        raise ValueError(
            f"Patient {patient_id!r} is associated with condition {patient.get('condition')!r}, "
            f"not {cond!r}."
        )

    weights = config.RECOMMENDATION_WEIGHTS
    w1 = float(weights["w1"])
    w2 = float(weights["w2"])
    w3 = float(weights["w3"])
    sentiment_score = float(config.SENTIMENT_SCORE_MAP[sent])
    guideline_table = config.GUIDELINE_SCORES[cond]
    ehr_scores: Dict[str, float] = patient.get("ehr_scores", {})

    scored: List[Dict[str, Any]] = []
    for drug in config.DRUG_MAP[cond]:
        guideline_score = float(guideline_table[drug])
        ehr_score = float(ehr_scores.get(drug, 0.5))
        recommendation_score = w1 * guideline_score + w2 * ehr_score + w3 * sentiment_score
        scored.append(
            {
                "drug": drug,
                "guideline_score": round(guideline_score, 4),
                "ehr_score": round(ehr_score, 4),
                "sentiment_score": sentiment_score,
                "recommendation_score": round(float(recommendation_score), 4),
            }
        )

    scored.sort(key=lambda row: row["recommendation_score"], reverse=True)
    top = scored[:3]
    LOGGER.debug(
        "Top recommendations for %s / %s: %s",
        patient_id,
        cond,
        [row["drug"] for row in top],
    )
    return top
