"""
FastAPI entry point for the SE-CDSS backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import feedback, recommend, trends
from src.database.db import init_db

LOGGER = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    init_db()
    LOGGER.info("Application startup complete (database ready).")
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

app.include_router(feedback.router)
app.include_router(recommend.router)
app.include_router(trends.router)


@app.get("/health")
def health() -> dict:
    """Liveness check for load balancers and local dev."""
    return {"status": "ok"}
