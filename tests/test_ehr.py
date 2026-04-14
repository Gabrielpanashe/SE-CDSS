"""
Simulated EHR loader tests.
"""

import os

import pytest

from src import config
from src.ehr.ehr_loader import clear_patient_cache, get_patient, list_patient_ids


@pytest.fixture(autouse=True)
def reset_ehr_cache() -> None:
    clear_patient_cache()
    yield
    clear_patient_cache()


def test_get_patient_known_id() -> None:
    if not os.path.exists(config.SIMULATED_EHR_PATH):
        pytest.skip("patients.json missing")
    patient = get_patient("P-00001")
    assert patient["condition"] == "hypertension"
    assert "ehr_scores" in patient


def test_get_patient_unknown_raises() -> None:
    if not os.path.exists(config.SIMULATED_EHR_PATH):
        pytest.skip("patients.json missing")
    with pytest.raises(KeyError):
        get_patient("P-99999")


def test_list_patient_ids_count() -> None:
    if not os.path.exists(config.SIMULATED_EHR_PATH):
        pytest.skip("patients.json missing")
    ids = list_patient_ids()
    assert len(ids) == 50
