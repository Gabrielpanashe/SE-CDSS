"""
Longitudinal prediction trends per patient.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.auth_utils import get_current_user
from src import config
from src.database.db import PredictionLog, User, get_db

router = APIRouter(prefix="/api", tags=["trends"])


class TrendEntry(BaseModel):
    """One prediction log summary for trend visualization."""

    log_id: int
    sentiment: str
    confidence: float
    risk_level: str
    drug_name: Optional[str] = None
    timestamp: str


class TrendsResponse(BaseModel):
    """Trend series with advisory disclaimer (contains risk/sentiment data)."""

    patient_id: str
    total_entries: int
    trends: List[TrendEntry]
    disclaimer: str
    explanation: Optional[str] = None


@router.get("/trends/{patient_id}", response_model=TrendsResponse)
def get_trends(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TrendsResponse:
    if current_user.role == "patient" and current_user.patient_id != patient_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied.")

    rows = (
        db.query(PredictionLog)
        .filter(PredictionLog.patient_id == patient_id)
        .order_by(PredictionLog.timestamp.asc())
        .all()
    )

    trends: List[TrendEntry] = []
    for row in rows:
        ts = row.timestamp
        trends.append(
            TrendEntry(
                log_id=int(row.id),
                sentiment=str(row.sentiment),
                confidence=float(row.confidence),
                risk_level=str(row.risk_level),
                drug_name=row.drug_name,
                timestamp=ts.isoformat() if ts is not None else "",
            )
        )

    return TrendsResponse(
        patient_id=patient_id,
        total_entries=len(trends),
        trends=trends,
        disclaimer=config.DISCLAIMER_TEXT,
        explanation=None,
    )
