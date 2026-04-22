"""
Phase D1 — Baseline Model Evaluation for SE-CDSS dissertation (Table 4.1).
Combines the full UCI Drug Review dataset, applies a reproducible 80/20 stratified
split (seed=42), trains TF-IDF + Logistic Regression, and saves metrics and figures.
"""

import logging
import os
import sys

import joblib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split

# ── make project root importable regardless of where the script is called from
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.preprocessing.text_normalization import clean_text, preprocess_text

# ── constants ─────────────────────────────────────────────────────────────────
RANDOM_SEED: int = 42          # same seed used in every phase — reproducibility
TEST_SIZE: float = 0.20        # 80 / 20 split
LABELS: list = ["NEGATIVE", "NEUTRAL", "POSITIVE"]  # display order on plots

DOCS_FIGURES: str = os.path.join(config.PROJECT_ROOT, "docs", "figures")
DOCS_RESULTS: str = os.path.join(config.PROJECT_ROOT, "docs", "results")

CONFUSION_MATRIX_PNG: str = os.path.join(DOCS_FIGURES, "baseline_confusion_matrix.png")
PER_CLASS_PNG: str = os.path.join(DOCS_FIGURES, "baseline_per_class_metrics.png")
METRICS_CSV: str = os.path.join(DOCS_RESULTS, "baseline_metrics.csv")

# ── logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def assign_sentiment_label(rating: float) -> str:
    """
    Convert a numeric drug rating (1–10) into a sentiment class label.

    Why three classes?  Ratings 1–3 represent clear negative experiences,
    4–6 are mixed/neutral, and 7–10 are positive — matching the thresholds
    already documented in Chapter 3 of the dissertation.

    Args:
        rating: Numeric rating from the UCI Drug Review dataset (1–10).

    Returns:
        One of 'NEGATIVE', 'NEUTRAL', or 'POSITIVE'.
    """
    if rating >= 7:
        return "POSITIVE"
    if rating >= 4:
        return "NEUTRAL"
    return "NEGATIVE"


def load_and_combine_raw_data() -> pd.DataFrame:
    """
    Load both UCI raw CSVs and combine them into a single DataFrame.

    Why combine?  The UCI dataset ships with a pre-made split that we do not
    control.  By merging and re-splitting with a fixed seed we get a fully
    reproducible 80/20 partition that is documented and owned by this project.

    Returns:
        Combined DataFrame with 'review' and 'sentiment' columns, NaN rows dropped.
    """
    logger.info("Loading raw datasets...")
    train_df = pd.read_csv(config.TRAIN_RAW_PATH)
    test_df  = pd.read_csv(config.TEST_RAW_PATH)

    combined = pd.concat([train_df, test_df], ignore_index=True)
    combined = combined.dropna(subset=["review", "rating"])
    combined["sentiment"] = combined["rating"].apply(assign_sentiment_label)

    logger.info(
        "Combined dataset: %s rows  |  class breakdown:\n%s",
        f"{len(combined):,}",
        combined["sentiment"].value_counts().to_string(),
    )
    return combined


def apply_preprocessing(df: pd.DataFrame) -> pd.DataFrame:
    """
    Run the SE-CDSS text pipeline on the 'review' column.

    Pipeline steps (defined in src/preprocessing/text_normalization.py):
      1. clean_text  — lowercase, strip HTML entities, remove punctuation
      2. preprocess_text — tokenise, remove stopwords, lemmatise

    Args:
        df: DataFrame with a 'review' column.

    Returns:
        DataFrame with 'processed_review' added; empty rows removed.
    """
    logger.info("Applying text preprocessing (this takes a minute)...")
    df = df.copy()
    df["clean_review"]     = df["review"].apply(clean_text)
    df["processed_review"] = df["clean_review"].apply(preprocess_text)
    df = df[df["processed_review"].str.strip() != ""]
    logger.info("After preprocessing: %s rows remain", f"{len(df):,}")
    return df


def split_data(df: pd.DataFrame):
    """
    Perform a stratified 80/20 train/test split.

    Stratified means each class (POSITIVE, NEUTRAL, NEGATIVE) keeps its
    original proportion in both halves — important because our dataset is
    imbalanced (POSITIVE ~66%, NEGATIVE ~22%, NEUTRAL ~12%).

    Args:
        df: Preprocessed DataFrame with 'processed_review' and 'sentiment'.

    Returns:
        Tuple of (X_train, X_test, y_train, y_test) as lists of strings.
    """
    X = df["processed_review"].tolist()
    y = df["sentiment"].tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_SEED,
        stratify=y,   # keeps class proportions identical in both halves
    )

    logger.info("Train size: %s  |  Test size: %s", f"{len(X_train):,}", f"{len(X_test):,}")
    return X_train, X_test, y_train, y_test


def build_and_train_model(X_train: list, y_train: list):
    """
    Vectorise training text with TF-IDF and fit a Logistic Regression classifier.

    TF-IDF settings match src/models/base_line_model.py exactly so results
    are comparable.  The trained model and vectorizer are also saved to
    models/baseline/ so the live API can load them.

    Args:
        X_train: List of preprocessed training review strings.
        y_train: Corresponding sentiment labels.

    Returns:
        Tuple of (fitted TfidfVectorizer, fitted LogisticRegression, X_train_vec).
    """
    logger.info("Fitting TF-IDF vectoriser...")
    vectorizer = TfidfVectorizer(
        max_features=50_000,
        ngram_range=(1, 2),
        min_df=3,
        sublinear_tf=True,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    logger.info("Vocabulary size: %s", f"{len(vectorizer.vocabulary_):,}")

    logger.info("Training Logistic Regression (this may take 1–2 minutes)...")
    model = LogisticRegression(
        max_iter=1_000,
        C=1.0,
        solver="lbfgs",
        n_jobs=-1,
    )
    model.fit(X_train_vec, y_train)
    logger.info("Training complete.")

    # Save artifacts so the live API (api/routes/feedback.py) can use this model
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    joblib.dump(model,      config.MODEL_PATH)
    joblib.dump(vectorizer, config.VECTORIZER_PATH)
    logger.info("Model + vectorizer saved to %s", config.MODEL_DIR)

    return vectorizer, model, X_train_vec


def evaluate_model(model, vectorizer, X_test: list, y_test: list) -> dict:
    """
    Run the trained model on the held-out test set and compute all metrics.

    Macro F1 is the primary dissertation metric because it treats each class
    equally — important when classes are imbalanced (POSITIVE 66%, NEUTRAL 12%).
    A high accuracy can hide poor performance on minority classes, but a high
    macro F1 means all three classes are classified well.

    Args:
        model:      Fitted LogisticRegression.
        vectorizer: Fitted TfidfVectorizer.
        X_test:     List of preprocessed test review strings.
        y_test:     True labels for the test set.

    Returns:
        Dictionary with all scalar metrics and per-class breakdowns.
    """
    logger.info("Running predictions on test set (%s samples)...", f"{len(X_test):,}")
    X_test_vec = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_vec)

    # ── overall metrics ───────────────────────────────────────────────────────
    accuracy     = accuracy_score(y_test, y_pred)
    macro_f1     = f1_score(y_test, y_pred, average="macro",    labels=LABELS)
    weighted_f1  = f1_score(y_test, y_pred, average="weighted", labels=LABELS)

    precision_per, recall_per, f1_per, support_per = precision_recall_fscore_support(
        y_test, y_pred, labels=LABELS
    )

    report = classification_report(y_test, y_pred, labels=LABELS, digits=4)

    return {
        "accuracy":         accuracy,
        "macro_f1":         macro_f1,
        "weighted_f1":      weighted_f1,
        "precision_per":    precision_per,
        "recall_per":       recall_per,
        "f1_per":           f1_per,
        "support_per":      support_per,
        "y_pred":           y_pred,
        "classification_report": report,
    }


def save_confusion_matrix(y_test: list, y_pred: list) -> None:
    """
    Generate and save a styled confusion matrix heatmap.

    The matrix shows how many reviews were correctly and incorrectly classified
    for each sentiment class.  Diagonal cells = correct predictions.

    Args:
        y_test: True labels.
        y_pred: Predicted labels.

    Returns:
        None. Saves PNG to docs/figures/baseline_confusion_matrix.png.
    """
    os.makedirs(DOCS_FIGURES, exist_ok=True)

    cm = confusion_matrix(y_test, y_pred, labels=LABELS)

    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=LABELS,
        yticklabels=LABELS,
        linewidths=0.5,
        linecolor="white",
        ax=ax,
        annot_kws={"size": 13, "weight": "bold"},
    )
    ax.set_title(
        "Baseline Model — Confusion Matrix\n(TF-IDF + Logistic Regression)",
        fontsize=13, fontweight="bold", pad=14, color="#0F2944",
    )
    ax.set_xlabel("Predicted Label", fontsize=11, labelpad=8)
    ax.set_ylabel("True Label",      fontsize=11, labelpad=8)
    ax.tick_params(axis="both", labelsize=10)
    fig.tight_layout()
    fig.savefig(CONFUSION_MATRIX_PNG, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Confusion matrix saved → %s", CONFUSION_MATRIX_PNG)


def save_per_class_bar_chart(metrics: dict) -> None:
    """
    Generate and save a grouped bar chart of per-class precision, recall, and F1.

    Grouped bars let an examiner instantly see where the model struggles —
    typically the minority NEUTRAL class.

    Args:
        metrics: Dictionary returned by evaluate_model().

    Returns:
        None. Saves PNG to docs/figures/baseline_per_class_metrics.png.
    """
    os.makedirs(DOCS_FIGURES, exist_ok=True)

    x     = np.arange(len(LABELS))
    width = 0.25
    colors = ["#0EA5E9", "#0F2944", "#22C55E"]  # teal, navy, green

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar(x - width, metrics["precision_per"], width, label="Precision", color=colors[0])
    ax.bar(x,          metrics["recall_per"],    width, label="Recall",    color=colors[1])
    ax.bar(x + width,  metrics["f1_per"],        width, label="F1",        color=colors[2])

    ax.set_xticks(x)
    ax.set_xticklabels(LABELS, fontsize=11)
    ax.set_ylim(0, 1.05)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(xmax=1, decimals=0))
    ax.set_xlabel("Sentiment Class",  fontsize=11, labelpad=8)
    ax.set_ylabel("Score",            fontsize=11, labelpad=8)
    ax.set_title(
        "Baseline Model — Per-Class Metrics\n(TF-IDF + Logistic Regression)",
        fontsize=13, fontweight="bold", pad=14, color="#0F2944",
    )
    ax.legend(fontsize=10)
    ax.grid(axis="y", linestyle="--", alpha=0.4)

    # annotate bar tops
    for bars in ax.containers:
        ax.bar_label(bars, fmt="%.2f", fontsize=8, padding=2)

    fig.tight_layout()
    fig.savefig(PER_CLASS_PNG, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Per-class bar chart saved → %s", PER_CLASS_PNG)


def save_metrics_csv(metrics: dict) -> None:
    """
    Save all evaluation metrics to a CSV file for the dissertation appendix.

    Args:
        metrics: Dictionary returned by evaluate_model().

    Returns:
        None. Saves CSV to docs/results/baseline_metrics.csv.
    """
    os.makedirs(DOCS_RESULTS, exist_ok=True)

    rows = []
    for i, label in enumerate(LABELS):
        rows.append({
            "model":     "TF-IDF + Logistic Regression",
            "class":     label,
            "precision": round(float(metrics["precision_per"][i]), 4),
            "recall":    round(float(metrics["recall_per"][i]),    4),
            "f1":        round(float(metrics["f1_per"][i]),        4),
            "support":   int(metrics["support_per"][i]),
        })
    # append overall row
    rows.append({
        "model":     "TF-IDF + Logistic Regression",
        "class":     "OVERALL (macro)",
        "precision": "",
        "recall":    "",
        "f1":        round(metrics["macro_f1"], 4),
        "support":   sum(int(s) for s in metrics["support_per"]),
    })
    rows.append({
        "model":     "TF-IDF + Logistic Regression",
        "class":     "OVERALL (weighted)",
        "precision": "",
        "recall":    "",
        "f1":        round(metrics["weighted_f1"], 4),
        "support":   "",
    })
    rows.append({
        "model":     "TF-IDF + Logistic Regression",
        "class":     "ACCURACY",
        "precision": "",
        "recall":    "",
        "f1":        round(metrics["accuracy"], 4),
        "support":   "",
    })

    df = pd.DataFrame(rows)
    df.to_csv(METRICS_CSV, index=False)
    logger.info("Metrics CSV saved → %s", METRICS_CSV)


def print_summary(metrics: dict) -> None:
    """
    Print a clean, human-readable summary table to the terminal.

    This is the content that goes into dissertation Table 4.1.

    Args:
        metrics: Dictionary returned by evaluate_model().

    Returns:
        None.
    """
    sep = "=" * 60
    print(f"\n{sep}")
    print("  PHASE D1 — BASELINE MODEL RESULTS  (Table 4.1)")
    print(sep)
    print(f"  Model        : TF-IDF + Logistic Regression")
    print(f"  Split        : 80 / 20 stratified  |  seed = {RANDOM_SEED}")
    print(sep)
    print(f"  Accuracy     : {metrics['accuracy']:.4f}  ({metrics['accuracy']*100:.2f}%)")
    print(f"  Macro F1     : {metrics['macro_f1']:.4f}  ({metrics['macro_f1']*100:.2f}%)")
    print(f"  Weighted F1  : {metrics['weighted_f1']:.4f}  ({metrics['weighted_f1']*100:.2f}%)")
    print(sep)
    print(f"  {'Class':<12} {'Precision':>10} {'Recall':>10} {'F1':>10} {'Support':>10}")
    print(f"  {'-'*52}")
    for i, label in enumerate(LABELS):
        print(
            f"  {label:<12} "
            f"{metrics['precision_per'][i]:>10.4f} "
            f"{metrics['recall_per'][i]:>10.4f} "
            f"{metrics['f1_per'][i]:>10.4f} "
            f"{int(metrics['support_per'][i]):>10,}"
        )
    print(sep)
    print("\nFull classification report:\n")
    print(metrics["classification_report"])
    print(sep)
    print("  Output files:")
    print(f"    {CONFUSION_MATRIX_PNG}")
    print(f"    {PER_CLASS_PNG}")
    print(f"    {METRICS_CSV}")
    print(sep + "\n")


def main() -> None:
    """
    Run the full Phase D1 evaluation pipeline end to end.

    Steps:
        1. Load and combine both UCI raw CSVs
        2. Apply the SE-CDSS preprocessing pipeline
        3. Stratified 80/20 split (seed=42)
        4. Train TF-IDF + Logistic Regression
        5. Evaluate on held-out test set
        6. Save confusion matrix PNG, per-class bar chart PNG, metrics CSV
        7. Print summary table (dissertation Table 4.1)

    Returns:
        None.
    """
    logger.info("=== Phase D1: Baseline Model Evaluation ===")

    combined = load_and_combine_raw_data()
    combined = apply_preprocessing(combined)

    X_train, X_test, y_train, y_test = split_data(combined)

    vectorizer, model, _ = build_and_train_model(X_train, y_train)

    metrics = evaluate_model(model, vectorizer, X_test, y_test)

    save_confusion_matrix(y_test, metrics["y_pred"])
    save_per_class_bar_chart(metrics)
    save_metrics_csv(metrics)

    print_summary(metrics)

    logger.info("Phase D1 complete. All output files saved.")


if __name__ == "__main__":
    main()
