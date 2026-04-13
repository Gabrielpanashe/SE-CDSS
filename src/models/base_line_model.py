"""
SE-CDSS - Baseline Sentiment Model Training
TF-IDF vectorisation + Logistic Regression classifier.
"""

import os
from typing import Dict

import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report,
)

from src import config

LABELS = ["NEGATIVE", "NEUTRAL", "POSITIVE"]


def baseline_model() -> Dict[str, float]:
    """
    Train and evaluate the baseline TF-IDF + Logistic Regression model.

    Args:
        None.

    Returns:
        Dictionary containing core weighted evaluation metrics.
    """
    print("Loading processed data...")
    train_df = pd.read_csv(config.TRAIN_PROCESSED_PATH)
    test_df = pd.read_csv(config.TEST_PROCESSED_PATH)

    # Drop missing just in case
    train_df = train_df.dropna(subset=["processed_review", "sentiment"])
    test_df  = test_df.dropna(subset=["processed_review", "sentiment"])

    X_train = train_df["processed_review"].tolist()
    y_train = train_df["sentiment"].tolist()

    X_test  = test_df["processed_review"].tolist()
    y_test  = test_df["sentiment"].tolist()

    print(f"Train samples: {len(X_train):,}")
    print(f"Test samples : {len(X_test):,}")

    #  TF-IDF Vectorisation 
    print("\nBuilding TF-IDF features...")

    vectorizer = TfidfVectorizer(
        max_features=50000,
        ngram_range=(1, 2),
        min_df=3,
        sublinear_tf=True,
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    print(f"Vocabulary size: {len(vectorizer.vocabulary_):,}")

    #  Train Model 
    print("\nTraining Logistic Regression model...")

    model = LogisticRegression(
    max_iter=1000,
    C=1.0,
    solver="lbfgs",
    n_jobs=-1,
)

    model.fit(X_train_vec, y_train)
    print("Training complete.")

    # Evaluation 
    print("\nEvaluating model...")

    y_pred = model.predict(X_test_vec)

    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted"
    )

    print("\n── Performance Metrics: ")
    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, labels=LABELS))

    #  Confusion Matrix 
    plot_confusion_matrix(y_test, y_pred)

    #  Saving the Model 
    os.makedirs(config.MODEL_DIR, exist_ok=True)

    joblib.dump(model, config.MODEL_PATH)
    joblib.dump(vectorizer, config.VECTORIZER_PATH)

    print("\nModel and vectorizer saved.")
    print("Baseline training complete ✅")
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
    }


def plot_confusion_matrix(y_true, y_pred) -> None:
    """
    Generate and save a confusion matrix image.

    Args:
        y_true: Ground-truth labels.
        y_pred: Predicted labels.

    Returns:
        None.
    """
    cm = confusion_matrix(y_true, y_pred, labels=LABELS)

    plt.figure(figsize=(6, 5))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        xticklabels=LABELS,
        yticklabels=LABELS,
    )

    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")

    os.makedirs(config.MODEL_DIR, exist_ok=True)
    plt.savefig(config.CONFUSION_MATRIX_PATH)
    plt.close()

    print("Confusion matrix saved.")


if __name__ == "__main__":
    baseline_model()