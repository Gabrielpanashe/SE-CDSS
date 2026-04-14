"""
Lightweight text cleaning and token normalization for inference and batch preprocessing.
Avoids pandas so prediction paths can load without the full data pipeline stack.
"""

import re
from typing import Optional

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


def _ensure_nltk_resource(resource_name: str, resource_path: str) -> None:
    """Ensure an NLTK resource exists, downloading it when required."""
    try:
        nltk.data.find(resource_path)
    except LookupError:
        nltk.download(resource_name, quiet=True)


_ensure_nltk_resource("stopwords", "corpora/stopwords")
_ensure_nltk_resource("wordnet", "corpora/wordnet")

STOP_WORDS = set(stopwords.words("english"))
LEMMATIZER = WordNetLemmatizer()


def clean_text(text: Optional[str]) -> str:
    """
    Perform initial text normalization.

    Args:
        text: Raw review text or null-like input.

    Returns:
        Lowercased text with HTML entities and punctuation removed.
    """
    if not isinstance(text, str):
        return ""
    normalized = text.lower()
    normalized = normalized.replace("&#039;", "'").replace("&amp;", "&")
    normalized = re.sub(r"[^a-z\s]", " ", normalized)
    return normalized


def preprocess_text(text: str) -> str:
    """
    Tokenize, remove stopwords/short tokens, and lemmatize text.

    Args:
        text: Normalized text string.

    Returns:
        Processed text suitable for vectorization.
    """
    words = text.split()
    words = [word for word in words if word not in STOP_WORDS]
    words = [word for word in words if len(word) > 2]
    words = [LEMMATIZER.lemmatize(word) for word in words]
    return " ".join(words)
