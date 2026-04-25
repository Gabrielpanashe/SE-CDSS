"""
FastAPI entry point for the SE-CDSS backend.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, feedback, notifications, recommend, trends
from src.database.db import init_db
from src import config

LOGGER = logging.getLogger(__name__)

BIOBERT_MODEL_DIR = os.path.join(config.PROJECT_ROOT, "models", "biobert_sentiment")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise DB and pre-warm models so the first request is instant."""
    init_db()
    LOGGER.info("Database ready.")

    # Pre-warm the baseline model (TF-IDF vectorizer + LR classifier)
    try:
        from src.models.predict import _load_model as load_baseline
        load_baseline()
        LOGGER.info("Baseline model pre-warmed.")
    except Exception as exc:
        LOGGER.warning("Baseline model not pre-warmed: %s", exc)

    # Pre-warm BioBERT only if the model directory exists (it's 414MB so log clearly)
    if os.path.isdir(BIOBERT_MODEL_DIR):
        try:
            from src.models.predict_bert import _load_model as load_biobert
            LOGGER.info("Pre-warming BioBERT model (loading ~414MB into RAM)…")
            load_biobert()
            LOGGER.info("BioBERT model pre-warmed — first request will be fast.")
        except Exception as exc:
            LOGGER.warning("BioBERT model not pre-warmed: %s", exc)
    else:
        LOGGER.info("BioBERT model directory not found — skipping pre-warm.")

    yield


app = FastAPI(
    title="SE-CDSS API",
    description="Sentiment-enhanced clinical decision support (advisory only).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(notifications.router)
app.include_router(recommend.router)
app.include_router(trends.router)


@app.get("/health")
def health() -> dict:
    """Liveness check. Also reports which models are loaded."""
    from src.models import predict, predict_bert
    return {
        "status": "ok",
        "baseline_loaded": predict._model is not None,
        "biobert_loaded":  predict_bert._model is not None,
    }
