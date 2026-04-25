"""
Patient medication feedback endpoint: sentiment, risk, persistence, disclaimer.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.auth_utils import get_current_user
from api.routes.notifications import create_review_notifications
from src import config
from src.database.db import User, get_db, save_prediction
from src.explainability.shap_explainer import explain as shap_explain
from src.models.predict import predict

LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["feedback"])


class FeedbackRequest(BaseModel):
    """Request body for submitted patient review text and optional context."""

    review: str = Field(..., min_length=1, description="Raw medication feedback text.")
    patient_id: Optional[str] = None
    drug_name: Optional[str] = None
    condition: Optional[str] = None


class FeedbackResponse(BaseModel):
    """API contract for feedback analysis including advisory disclaimer."""

    sentiment: str
    confidence: float
    risk_level: str
    probabilities: Dict[str, float]
    log_id: int
    disclaimer: str
    explanation: Optional[str] = None


@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    body: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackResponse:
    """
    Run NLP sentiment and risk classification on a review and persist the result.

    Args:
        body: Raw review and optional patient or drug context.
        db: Database session.

    Returns:
        Prediction fields, log identifier, disclaimer, and placeholder explanation.
    """
    try:
        prediction: Dict[str, Any] = predict(body.review)
    except RuntimeError as exc:
        LOGGER.warning("Prediction unavailable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Prediction service is unavailable. Ensure model artifacts exist.",
        ) from exc
    except Exception as exc:
        LOGGER.exception("Unexpected prediction error")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during prediction.",
        ) from exc

    try:
        record = save_prediction(
            db,
            prediction,
            raw_review=body.review,
            patient_id=body.patient_id,
            drug_name=body.drug_name,
            condition=body.condition,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        create_review_notifications(
            db,
            from_user_id=current_user.id,
            prediction_log_id=int(record.id),
            patient_id=body.patient_id,
        )
    except Exception:
        LOGGER.warning("Notification creation failed — non-fatal.")

    shap_result = shap_explain(body.review)
    explanation = (
        f"Supporting words: {', '.join(shap_result['top_positive']) or 'none'}. "
        f"Contradicting words: {', '.join(shap_result['top_negative']) or 'none'}."
        if (shap_result["top_positive"] or shap_result["top_negative"])
        else None
    )

    return FeedbackResponse(
        sentiment=prediction["sentiment"],
        confidence=float(prediction["confidence"]),
        risk_level=prediction["risk_level"],
        probabilities=prediction["probabilities"],
        log_id=int(record.id),
        disclaimer=config.DISCLAIMER_TEXT,
        explanation=explanation,
    )
