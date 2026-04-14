"""
Tests for text normalization helpers used by the sentiment pipeline.
"""

from src.preprocessing.text_normalization import clean_text, preprocess_text


def test_clean_text_lowercase_and_strips_noise() -> None:
    raw = "Great drug! &#039;Relief&#039; &amp; energy."
    out = clean_text(raw)
    assert "great" in out
    assert "relief" in out
    assert "energy" in out
    assert "!" not in out


def test_clean_text_non_string_returns_empty() -> None:
    assert clean_text(None) == ""


def test_preprocess_text_removes_short_tokens() -> None:
    cleaned = clean_text("I am ok now with medication")
    processed = preprocess_text(cleaned)
    assert "medication" in processed or "medicate" in processed
    assert "am" not in processed.split()
