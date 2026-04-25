"""
Notification routes: list, mark-read, clinician respond.
"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.auth_utils import get_current_user
from src.database.db import Notification, User, get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: int
    type: str
    from_user_id: Optional[int] = None
    prediction_log_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: str
    followup_due_at: Optional[str] = None


class RespondRequest(BaseModel):
    to_user_id: int
    message: str
    prediction_log_id: Optional[int] = None


def _fmt(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


@router.get("", response_model=List[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[NotificationOut]:
    rows = (
        db.query(Notification)
        .filter(
            (Notification.to_user_id == current_user.id) |
            (Notification.to_user_id.is_(None) & (current_user.role == "clinician"))
        )
        .filter(Notification.is_read == False)  # noqa: E712
        .order_by(Notification.created_at.desc())
        .all()
    )
    return [
        NotificationOut(
            id=n.id,
            type=n.type,
            from_user_id=n.from_user_id,
            prediction_log_id=n.prediction_log_id,
            message=n.message,
            is_read=bool(n.is_read),
            created_at=_fmt(n.created_at) or "",
            followup_due_at=_fmt(n.followup_due_at),
        )
        for n in rows
    ]


@router.post("/{notification_id}/read", status_code=200)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found.")
    if notif.to_user_id not in (None, current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied.")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read."}


@router.post("/respond", status_code=201)
def respond(
    body: RespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if current_user.role != "clinician":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only clinicians can send responses.")
    notif = Notification(
        type="clinician_response",
        from_user_id=current_user.id,
        to_user_id=body.to_user_id,
        prediction_log_id=body.prediction_log_id,
        message=body.message,
    )
    db.add(notif)
    db.commit()
    return {"message": "Response sent."}


def create_review_notifications(
    db: Session,
    from_user_id: Optional[int],
    prediction_log_id: int,
    patient_id: Optional[str],
) -> None:
    """Called by the feedback route after a review is saved."""
    summary = f"New review submitted" + (f" by patient {patient_id}" if patient_id else "") + "."
    broadcast = Notification(
        type="new_review",
        from_user_id=from_user_id,
        to_user_id=None,  # broadcast — all clinicians see it
        prediction_log_id=prediction_log_id,
        message=summary,
    )
    db.add(broadcast)

    # Follow-up reminder for the submitting patient (if they are logged in)
    if from_user_id:
        reminder = Notification(
            type="followup_reminder",
            from_user_id=None,
            to_user_id=from_user_id,
            prediction_log_id=prediction_log_id,
            message="Please submit a follow-up review in 7 days to help track your progress.",
            followup_due_at=datetime.utcnow() + timedelta(days=7),
        )
        db.add(reminder)

    db.commit()
