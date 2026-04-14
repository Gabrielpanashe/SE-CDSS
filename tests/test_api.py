"""
HTTP API contract tests using FastAPI TestClient.
"""

import os

import pytest
from fastapi.testclient import TestClient

from api.main import app
from src import config


@pytest.fixture(name="client")
def fixture_client() -> TestClient:
    return TestClient(app)


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_feedback_includes_disclaimer(client: TestClient) -> None:
    response = client.post(
        "/api/feedback",
        json={"review": "I feel fine on this dose.", "patient_id": "P-API-1"},
    )
    if response.status_code == 503:
        pytest.skip("Model artifacts unavailable")
    assert response.status_code == 200
    body = response.json()
    assert body["disclaimer"] == config.DISCLAIMER_TEXT
    assert body["explanation"] is None
    assert "sentiment" in body and "probabilities" in body


def test_recommend_returns_top_three(client: TestClient) -> None:
    if not os.path.exists(config.SIMULATED_EHR_PATH):
        pytest.skip("patients.json missing")
    response = client.get(
        "/api/recommend",
        params={
            "condition": "hypertension",
            "patient_id": "P-00001",
            "sentiment": "positive",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["disclaimer"] == config.DISCLAIMER_TEXT
    assert len(data["recommendations"]) == 3
    for item in data["recommendations"]:
        assert set(item.keys()) >= {
            "drug",
            "guideline_score",
            "ehr_score",
            "sentiment_score",
            "recommendation_score",
        }


def test_trends_shape(client: TestClient) -> None:
    response = client.get("/api/trends/nonexistent-patient-xyz")
    assert response.status_code == 200
    body = response.json()
    assert body["total_entries"] == 0
    assert body["disclaimer"] == config.DISCLAIMER_TEXT
