"""
Load synthetic patient cohort from JSON for recommendation EHR scores.
"""

import json
import logging
from functools import lru_cache
from typing import Any, Dict, List

from src import config

LOGGER = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load_cohort_index() -> Dict[str, Dict[str, Any]]:
    """
    Load and index patients.json by patient_id.

    Returns:
        Mapping of patient_id to record dict.

    Raises:
        FileNotFoundError: If the simulated EHR file is missing.
        ValueError: If JSON structure is invalid.
    """
    path = config.SIMULATED_EHR_PATH
    try:
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
    except FileNotFoundError as exc:
        LOGGER.error("Simulated EHR file not found at %s", path)
        raise FileNotFoundError(
            f"Simulated EHR data not found at {path}. Generate or restore patients.json."
        ) from exc

    if not isinstance(payload, list):
        raise ValueError("patients.json must contain a JSON array of patient objects.")

    index: Dict[str, Dict[str, Any]] = {}
    for entry in payload:
        if not isinstance(entry, dict) or "patient_id" not in entry:
            raise ValueError("Each patient entry must be an object with patient_id.")
        pid = str(entry["patient_id"])
        index[pid] = entry
    return index


def get_patient(patient_id: str) -> Dict[str, Any]:
    """
    Return a single synthetic patient record.

    Args:
        patient_id: Identifier such as P-00001.

    Returns:
        Patient dictionary including ehr_scores for that cohort.

    Raises:
        KeyError: If the patient_id is not present in the simulated data.
    """
    index = _load_cohort_index()
    if patient_id not in index:
        raise KeyError(f"Unknown patient_id: {patient_id!r}")
    return dict(index[patient_id])


def list_patient_ids() -> List[str]:
    """
    Return all simulated patient identifiers (useful for tests and tooling).

    Returns:
        Sorted list of patient_id strings.
    """
    return sorted(_load_cohort_index().keys())


def clear_patient_cache() -> None:
    """Drop the in-memory cohort cache (e.g. after replacing patients.json in tests)."""
    _load_cohort_index.cache_clear()
