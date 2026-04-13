"""
SE-CDSS - Database Module (Enhanced)

Includes:
- Predictions
- Feedback
- Recommendations
- EHR (patient clinical data)
- Drug Insights (aggregated intelligence)
"""

import logging
from datetime import datetime
from typing import Any, Dict, Generator, Optional

from sqlalchemy import (
    create_engine, Column, Integer, String,
    Float, Text, DateTime, Boolean
)
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from src import config

LOGGER = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────────────

ENGINE_KWARGS: Dict[str, Any] = {}
if config.DATABASE_URL.startswith("sqlite"):
    ENGINE_KWARGS["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    config.DATABASE_URL,
    **ENGINE_KWARGS
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────────────────
# TABLES
# ─────────────────────────────────────────────────────

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True)
    patient_id = Column(String, index=True)

    raw_review = Column(Text, nullable=False)
    cleaned_review = Column(Text)

    drug_name = Column(String)
    condition = Column(String)

    sentiment = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)


class PatientFeedback(Base):
    __tablename__ = "patient_feedback"

    id = Column(Integer, primary_key=True)

    patient_id = Column(String, index=True)
    drug_name = Column(String)
    condition = Column(String)

    feedback = Column(Text, nullable=False)
    rating = Column(Integer)

    timestamp = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True)

    patient_id = Column(String, index=True)
    condition = Column(String, nullable=False)

    recommended_drug = Column(String, nullable=False)
    recommendation_score = Column(Float, nullable=False)

    sentiment_score = Column(Float)
    guideline_score = Column(Float)
    ehr_score = Column(Float)

    clinician_accepted = Column(Boolean)

    timestamp = Column(DateTime, default=datetime.utcnow)


class EHR(Base):
    """Simulated Electronic Health Records"""

    __tablename__ = "ehr"

    id = Column(Integer, primary_key=True)

    patient_id = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)

    condition = Column(String)
    drug_name = Column(String)

    notes = Column(Text)  # doctor notes / patient history

    record_date = Column(DateTime, default=datetime.utcnow)


class DrugInsight(Base):
    """Aggregated drug-level statistics"""

    __tablename__ = "drug_insights"

    id = Column(Integer, primary_key=True)

    drug_name = Column(String, index=True)
    condition = Column(String)

    total_reviews = Column(Integer, default=0)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)

    avg_confidence = Column(Float)

    last_updated = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────────────
# INITIALIZATION
# ─────────────────────────────────────────────────────

def init_db():
    """
    Create all database tables if they do not exist.

    Args:
        None.

    Returns:
        None.
    """
    Base.metadata.create_all(bind=engine)
    LOGGER.info("Database initialized with all tables.")


# ─────────────────────────────────────────────────────
# SESSION HANDLER
# ─────────────────────────────────────────────────────

def get_db() -> Generator[Session, None, None]:
    """
    Yield database session for dependency injection and close safely.

    Args:
        None.

    Returns:
        Generator yielding SQLAlchemy Session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────────────
# SAVE FUNCTIONS
# ─────────────────────────────────────────────────────

def save_prediction(
    db: Session,
    prediction: Dict[str, Any],
    raw_review: str,
    patient_id: Optional[str] = None,
    drug_name: Optional[str] = None,
    condition: Optional[str] = None,
) -> PredictionLog:
    """
    Persist a sentiment prediction record.

    Args:
        db: Active database session.
        prediction: Prediction payload containing sentiment/confidence/risk fields.
        raw_review: Original patient review text.
        patient_id: Optional patient identifier.
        drug_name: Optional drug name.
        condition: Optional condition name.

    Returns:
        Saved PredictionLog record.
    """
    required_keys = {"sentiment", "confidence", "risk_level"}
    missing_keys = sorted(required_keys.difference(prediction.keys()))
    if missing_keys:
        raise ValueError(f"Prediction payload missing required keys: {missing_keys}")

    record = PredictionLog(
        patient_id=patient_id,
        raw_review=raw_review,
        cleaned_review=prediction.get("cleaned_text"),

        drug_name=drug_name,
        condition=condition,

        sentiment=prediction["sentiment"],
        confidence=prediction["confidence"],
        risk_level=prediction["risk_level"]
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def save_feedback(
    db: Session,
    patient_id: str,
    feedback: str,
    drug_name: Optional[str] = None,
    condition: Optional[str] = None,
    rating: Optional[int] = None,
) -> PatientFeedback:
    """
    Persist raw patient feedback.

    Args:
        db: Active database session.
        patient_id: Patient identifier.
        feedback: Feedback text.
        drug_name: Optional drug name.
        condition: Optional condition.
        rating: Optional numeric patient rating.

    Returns:
        Saved PatientFeedback record.
    """

    record = PatientFeedback(
        patient_id=patient_id,
        feedback=feedback,
        drug_name=drug_name,
        condition=condition,
        rating=rating
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def save_recommendation(db: Session, data: Dict[str, Any]) -> Recommendation:
    """
    Persist a recommendation record.

    Args:
        db: Active database session.
        data: Recommendation data matching Recommendation model fields.

    Returns:
        Saved Recommendation record.
    """
    record = Recommendation(**data)

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def save_ehr(db: Session, data: Dict[str, Any]) -> EHR:
    """
    Persist a simulated EHR record.

    Args:
        db: Active database session.
        data: EHR data matching EHR model fields.

    Returns:
        Saved EHR record.
    """
    record = EHR(**data)

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


if __name__ == "__main__":
    init_db()