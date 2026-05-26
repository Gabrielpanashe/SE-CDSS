"""
HTTP API contract tests using FastAPI TestClient.
"""

import os

import pytest
from fastapi.testclient import TestClient

from api.main import app
from src import config

_TEST_EMAIL = "test-clinician@se-cdss.test"
_TEST_PASSWORD = "TestPass123!"


@pytest.fixture(name="client")
def fixture_client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(name="auth_headers")
def fixture_auth_headers(client: TestClient) -> dict:
    """Register a clinician test user and return a valid Bearer auth header."""
    client.post(
        "/auth/register",
        json={"email": _TEST_EMAIL, "password": _TEST_PASSWORD, "role": "clinician"},
    )
    resp = client.post(
        "/auth/login",
        json={"email": _TEST_EMAIL, "password": _TEST_PASSWORD},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_and_login(client: TestClient) -> None:
    email = "new-user@se-cdss.test"
    resp = client.post(
        "/auth/register",
        json={"email": email, "password": "Pass123!", "role": "patient", "patient_id": "P-00001"},
    )
    assert resp.status_code in (201, 409)

    resp = client.post("/auth/login", json={"email": email, "password": "Pass123!"})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["role"] == "patient"


def test_login_invalid_credentials(client: TestClient) -> None:
    resp = client.post("/auth/login", json={"email": "nobody@x.com", "password": "wrong"})
    assert resp.status_code == 401


def test_feedback_requires_auth(client: TestClient) -> None:
    resp = client.post("/api/feedback", json={"review": "test"})
    assert resp.status_code == 401


@pytest.mark.slow
def test_feedback_includes_disclaimer(client: TestClient, auth_headers: dict) -> None:
    response = client.post(
        "/api/feedback",
        json={"review": "I feel fine on this dose.", "patient_id": "P-API-1"},
        headers=auth_headers,
    )
    if response.status_code == 503:
        pytest.skip("Model artifacts unavailable")
    assert response.status_code == 200
    body = response.json()
    assert body["disclaimer"] == config.DISCLAIMER_TEXT
    assert "explanation" in body  # may be None or a SHAP string
    assert "sentiment" in body and "probabilities" in body


def test_recommend_requires_clinician(client: TestClient) -> None:
    resp = client.get(
        "/api/recommend",
        params={"condition": "hypertension", "patient_id": "P-00001", "sentiment": "positive"},
    )
    assert resp.status_code == 401


@pytest.mark.slow
def test_recommend_returns_top_three(client: TestClient, auth_headers: dict) -> None:
    if not os.path.exists(config.SIMULATED_EHR_PATH):
        pytest.skip("patients.json missing")
    response = client.get(
        "/api/recommend",
        params={
            "condition": "hypertension",
            "patient_id": "P-00001",
            "sentiment": "positive",
        },
        headers=auth_headers,
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


def test_trends_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/trends/P-00001")
    assert resp.status_code == 401


@pytest.mark.slow
def test_trends_shape(client: TestClient, auth_headers: dict) -> None:
    response = client.get("/api/trends/nonexistent-patient-xyz", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["total_entries"] == 0
    assert body["disclaimer"] == config.DISCLAIMER_TEXT


def test_register_duplicate_email(client: TestClient) -> None:
    """Second registration with the same email must return 409 Conflict."""
    payload = {"email": "dup@se-cdss.test", "password": "Pass123!", "role": "patient"}
    client.post("/auth/register", json=payload)
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_invalid_role(client: TestClient) -> None:
    """Role values outside 'patient'/'clinician' must be rejected with 400."""
    resp = client.post(
        "/auth/register",
        json={"email": "badrole@se-cdss.test", "password": "Pass123!", "role": "admin"},
    )
    assert resp.status_code == 400


def test_me_endpoint_returns_correct_role(client: TestClient, auth_headers: dict) -> None:
    """GET /auth/me returns the authenticated user's email and role."""
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == _TEST_EMAIL
    assert body["role"] == "clinician"


def test_notifications_requires_auth(client: TestClient) -> None:
    """Notification list endpoint must be JWT-protected."""
    resp = client.get("/notifications")
    assert resp.status_code == 401


def test_patient_cannot_view_other_patient_trends(client: TestClient) -> None:
    """A patient is forbidden from accessing another patient's trend data (403)."""
    email = "p-access@se-cdss.test"
    client.post(
        "/auth/register",
        json={"email": email, "password": "Pass123!", "role": "patient", "patient_id": "P-ACCA"},
    )
    resp = client.post("/auth/login", json={"email": email, "password": "Pass123!"})
    assert resp.status_code == 200
    headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    # Own trends — allowed
    assert client.get("/api/trends/P-ACCA", headers=headers).status_code == 200
    # Another patient's trends — forbidden
    assert client.get("/api/trends/P-99999", headers=headers).status_code == 403
