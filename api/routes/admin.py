"""
Admin routes: system status and periodic retraining trigger (clinician only).
"""

import logging
import subprocess
import sys
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.auth_utils import require_clinician
from src.database.db import PredictionLog, User, get_db

LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

RETRAIN_THRESHOLD = 500


def _get_config_value(db: Session, key: str) -> Optional[str]:
    from sqlalchemy import text
    try:
        row = db.execute(text("SELECT value FROM system_config WHERE key = :k"), {"k": key}).fetchone()
        return row[0] if row else None
    except Exception:
        return None


def _set_config_value(db: Session, key: str, value: str) -> None:
    from sqlalchemy import text
    try:
        existing = db.execute(text("SELECT key FROM system_config WHERE key = :k"), {"k": key}).fetchone()
        if existing:
            db.execute(text("UPDATE system_config SET value = :v WHERE key = :k"), {"v": value, "k": key})
        else:
            db.execute(text("INSERT INTO system_config (key, value) VALUES (:k, :v)"), {"k": key, "v": value})
        db.commit()
    except Exception as exc:
        LOGGER.warning("system_config write failed: %s", exc)


def _ensure_system_config_table(db: Session) -> None:
    from sqlalchemy import text
    try:
        db.execute(text(
            "CREATE TABLE IF NOT EXISTS system_config (key TEXT PRIMARY KEY, value TEXT)"
        ))
        db.commit()
    except Exception:
        pass


class StatusResponse(BaseModel):
    last_retrained_at: Optional[str]
    reviews_since_retrain: int
    retrain_threshold: int
    needs_retrain: bool


class RetrainResponse(BaseModel):
    status: str
    message: str


@router.get("/status", response_model=StatusResponse)
def get_status(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_clinician),
) -> StatusResponse:
    _ensure_system_config_table(db)
    last_retrained_at = _get_config_value(db, "last_retrained_at")
    total = db.query(PredictionLog).count()
    since_str = _get_config_value(db, "reviews_at_last_retrain") or "0"
    reviews_since = max(0, total - int(since_str))
    return StatusResponse(
        last_retrained_at=last_retrained_at,
        reviews_since_retrain=reviews_since,
        retrain_threshold=RETRAIN_THRESHOLD,
        needs_retrain=reviews_since >= RETRAIN_THRESHOLD,
    )


@router.post("/retrain", response_model=RetrainResponse)
def trigger_retrain(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_clinician),
) -> RetrainResponse:
    _ensure_system_config_table(db)
    try:
        result = subprocess.run(
            [sys.executable, "scripts/retrain_baseline.py"],
            capture_output=True,
            text=True,
            timeout=600,
        )
        if result.returncode != 0:
            LOGGER.error("Retrain failed: %s", result.stderr)
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                f"Retraining script failed: {result.stderr[-500:]}",
            )
        total = db.query(PredictionLog).count()
        _set_config_value(db, "last_retrained_at", datetime.utcnow().isoformat())
        _set_config_value(db, "reviews_at_last_retrain", str(total))
        return RetrainResponse(status="success", message="Baseline model retrained successfully.")
    except HTTPException:
        raise
    except subprocess.TimeoutExpired:
        raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, "Retraining timed out after 10 minutes.")
    except Exception as exc:
        LOGGER.exception("Unexpected retrain error")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc)) from exc
