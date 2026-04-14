"""
Drug recommendation endpoint (scoring engine wired in Phase C).
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from src import config
from src.recommendation.recommender import get_recommendations as compute_recommendations

LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["recommend"])


class RecommendationItem(BaseModel):
    """Single drug recommendation with component scores."""

    drug: str
    guideline_score: float
    ehr_score: float
    sentiment_score: float
    recommendation_score: float


class RecommendResponse(BaseModel):
    """Recommendation list with mandatory advisory disclaimer."""

    condition: str
    patient_id: str
    recommendations: List[RecommendationItem]
    disclaimer: str
    explanation: Optional[str] = None


@router.get("/recommend", response_model=RecommendResponse)
def get_recommendations(
    condition: str = Query(..., description="Clinical condition key, e.g. hypertension."),
    patient_id: str = Query(..., description="Patient identifier, e.g. P-00001."),
    sentiment: str = Query(
        ...,
        description="Latest patient sentiment: positive, neutral, or negative.",
    ),
) -> RecommendResponse:
    """
    Return ranked drug recommendations for a condition and patient.

    Args:
        condition: One of the configured target conditions.
        patient_id: Patient id for EHR lookup (used in Phase C).
        sentiment: Sentiment label for the sentiment score component.

    Returns:
        Response matching the API contract including disclaimer.
    """
    normalized_condition = condition.strip().lower()
    if normalized_condition not in config.DRUG_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown condition. Allowed: {', '.join(config.TARGET_CONDITIONS)}.",
        )

    normalized_sentiment = sentiment.strip().lower()
    if normalized_sentiment not in config.SENTIMENT_SCORE_MAP:
        raise HTTPException(
            status_code=400,
            detail="Invalid sentiment. Use: positive, neutral, or negative.",
        )

    try:
        items = compute_recommendations(
            normalized_condition,
            patient_id.strip(),
            normalized_sentiment,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        LOGGER.error("EHR data missing: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Simulated EHR data is not available on the server.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return RecommendResponse(
        condition=normalized_condition,
        patient_id=patient_id.strip(),
        recommendations=[RecommendationItem(**item) for item in items],
        disclaimer=config.DISCLAIMER_TEXT,
        explanation=None,
    )
