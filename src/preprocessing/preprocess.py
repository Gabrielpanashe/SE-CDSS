"""
Text preprocessing pipeline for the SE-CDSS sentiment model.
Loads raw review data, cleans text, creates sentiment labels, and saves processed CSVs.
"""

import logging
import os
from typing import Tuple

import pandas as pd

from src import config
from src.preprocessing.text_normalization import clean_text, preprocess_text

LOGGER = logging.getLogger(__name__)


def load_data(train_path: str, test_path: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Load training and testing datasets from CSV files.

    Args:
        train_path: Absolute path to training CSV.
        test_path: Absolute path to testing CSV.

    Returns:
        Tuple containing training and testing DataFrames.
    """
    LOGGER.info("Loading datasets from %s and %s", train_path, test_path)
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    return train_df, test_df


def remove_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows with missing review text or rating values.

    Args:
        df: Input DataFrame.

    Returns:
        DataFrame with required rows retained.
    """
    return df.dropna(subset=["review", "rating"])


def assign_sentiment_label(rating: float) -> str:
    """
    Convert numeric rating to sentiment class label.

    Args:
        rating: Rating on 1-10 style scale.

    Returns:
        Sentiment label as POSITIVE, NEUTRAL, or NEGATIVE.
    """
    if rating >= 7:
        return "POSITIVE"
    if rating >= 5:
        return "NEUTRAL"
    return "NEGATIVE"


def add_sentiment_column(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a `sentiment` column computed from the `rating` column.

    Args:
        df: Input DataFrame with a rating column.

    Returns:
        Updated DataFrame with sentiment labels.
    """
    df["sentiment"] = df["rating"].apply(assign_sentiment_label)
    return df


def process_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply full text cleaning/preprocessing pipeline to a DataFrame.

    Args:
        df: DataFrame containing a `review` column.

    Returns:
        DataFrame with clean/processed text columns and non-empty rows.
    """
    df["clean_review"] = df["review"].apply(clean_text)
    df["processed_review"] = df["clean_review"].apply(preprocess_text)
    return df[df["processed_review"].str.strip() != ""]


def save_data(train_df: pd.DataFrame, test_df: pd.DataFrame, output_dir: str) -> None:
    """
    Save processed training and testing DataFrames to disk.

    Args:
        train_df: Processed training DataFrame.
        test_df: Processed testing DataFrame.
        output_dir: Output directory for processed CSV files.

    Returns:
        None.
    """
    os.makedirs(output_dir, exist_ok=True)
    train_df.to_csv(config.TRAIN_PROCESSED_PATH, index=False)
    test_df.to_csv(config.TEST_PROCESSED_PATH, index=False)
    LOGGER.info("Saved processed datasets to %s", output_dir)


def main() -> None:
    """
    Run end-to-end preprocessing for train and test datasets.

    Args:
        None.

    Returns:
        None.
    """
    train_df, test_df = load_data(config.TRAIN_RAW_PATH, config.TEST_RAW_PATH)
    train_df = process_dataframe(add_sentiment_column(remove_missing_values(train_df)))
    test_df = process_dataframe(add_sentiment_column(remove_missing_values(test_df)))
    save_data(train_df, test_df, config.PROCESSED_DATA_DIR)
    print(f"Saved processed data to: {config.PROCESSED_DATA_DIR}")


if __name__ == "__main__":
    main()