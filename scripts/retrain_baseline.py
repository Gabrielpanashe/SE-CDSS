"""
Periodic retraining script for SE-CDSS.
Merges accumulated prediction_logs with original training data and retrains
the TF-IDF + Logistic Regression baseline model. Called by POST /admin/retrain.

Note: BioBERT (the live inference model) requires GPU and ~24h of training;
its retraining is triggered separately from scripts/train_biobert.py using the
epoch_3 checkpoint. This script keeps the baseline current as a fast fallback
and demonstrates the continuous-learning capability required by the architecture.
"""

import logging
import os
import sys

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.database.db import PredictionLog, SessionLocal
from src.preprocessing.text_normalization import clean_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOGGER = logging.getLogger(__name__)

RANDOM_SEED = 42
MIN_NEW_SAMPLES = 10


def load_new_samples() -> pd.DataFrame:
    db = SessionLocal()
    try:
        rows = db.query(PredictionLog).filter(
            PredictionLog.sentiment.isnot(None),
            PredictionLog.raw_review.isnot(None),
        ).all()
        records = [
            {"text": r.raw_review, "sentiment": r.sentiment.upper()}
            for r in rows
            if r.sentiment and r.raw_review
        ]
        return pd.DataFrame(records)
    finally:
        db.close()


def load_original_training() -> pd.DataFrame:
    path = config.TRAIN_PROCESSED_PATH
    if not os.path.exists(path):
        LOGGER.warning("Processed training CSV not found at %s — using new samples only.", path)
        return pd.DataFrame(columns=["text", "sentiment"])
    df = pd.read_csv(path)
    if "cleaned_review" in df.columns:
        df = df.rename(columns={"cleaned_review": "text"})
    return df[["text", "sentiment"]].dropna()


def main() -> None:
    LOGGER.info("Loading new samples from prediction_logs…")
    new_df = load_new_samples()
    LOGGER.info("New samples from usage: %d", len(new_df))

    if len(new_df) < MIN_NEW_SAMPLES:
        LOGGER.warning(
            "Only %d new samples available (threshold: %d) — skipping retrain.",
            len(new_df), MIN_NEW_SAMPLES,
        )
        return

    LOGGER.info("Loading original training data…")
    orig_df = load_original_training()
    LOGGER.info("Original training samples: %d", len(orig_df))

    combined = pd.concat([orig_df, new_df], ignore_index=True).dropna()
    combined["text"] = combined["text"].astype(str).apply(clean_text)
    combined = combined[combined["text"].str.strip() != ""]
    LOGGER.info("Combined dataset: %d samples", len(combined))

    X_train, X_test, y_train, y_test = train_test_split(
        combined["text"], combined["sentiment"],
        test_size=0.20, random_state=RANDOM_SEED, stratify=combined["sentiment"],
    )

    LOGGER.info("Fitting TF-IDF vectorizer…")
    vectorizer = TfidfVectorizer(max_features=50_000, ngram_range=(1, 2), min_df=2)
    X_train_vec = vectorizer.fit_transform(X_train)

    LOGGER.info("Training Logistic Regression…")
    model = LogisticRegression(max_iter=1000, C=1.0, random_state=RANDOM_SEED, class_weight="balanced")
    model.fit(X_train_vec, y_train)

    X_test_vec = vectorizer.transform(X_test)
    acc = model.score(X_test_vec, y_test)
    LOGGER.info("Retrained baseline accuracy on held-out set: %.4f", acc)

    joblib.dump(model, config.MODEL_PATH)
    joblib.dump(vectorizer, config.VECTORIZER_PATH)
    LOGGER.info("Baseline model and vectorizer saved to %s", config.MODEL_DIR)
    LOGGER.info("Retraining complete.")


if __name__ == "__main__":
    main()
