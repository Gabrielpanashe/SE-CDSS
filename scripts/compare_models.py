"""
Phase D2 — Model Comparison Script for SE-CDSS dissertation (Table 4.3).

Both models are trained on the SAME 80% training split and evaluated on the
SAME 20% test split — a scientifically fair comparison that isolates the effect
of model architecture (TF-IDF+LR vs BioBERT) from training data size.

train_biobert.py saves both the train and test splits to biobert_test_data.pkl.
This script retrains the TF-IDF+LR baseline from scratch on that same training
split instead of using the pre-saved model (which was trained on 172k samples).

Equal training data → BioBERT's biomedical pre-training advantage is the sole
differentiating factor — which is the valid H2 hypothesis test.
"""

import logging
import os
import sys

import joblib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.preprocessing.text_normalization import preprocess_text

# ── paths ─────────────────────────────────────────────────────────────────────
BIOBERT_MODEL_DIR: str = os.path.join(config.PROJECT_ROOT, "models", "biobert_sentiment")
TEST_DATA_PKL: str     = os.path.join(config.PROJECT_ROOT, "docs", "results", "biobert_test_data.pkl")
COMPARISON_CSV: str    = os.path.join(config.PROJECT_ROOT, "docs", "results", "model_comparison.csv")
COMPARISON_PNG: str    = os.path.join(config.PROJECT_ROOT, "docs", "figures", "model_comparison.png")

LABELS: list   = ["NEGATIVE", "NEUTRAL", "POSITIVE"]
ID2LABEL: dict = {0: "NEGATIVE", 1: "NEUTRAL", 2: "POSITIVE"}
MAX_LENGTH: int = 128
BATCH_SIZE: int = 16

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)
logging.getLogger("transformers").setLevel(logging.ERROR)


# ── minimal dataset for batched BioBERT inference ─────────────────────────────

class InferenceDataset(Dataset):
    """Wraps a list of tokenised texts for batched forward passes."""

    def __init__(self, texts: list, tokenizer) -> None:
        self.encodings = tokenizer(
            texts,
            max_length=MAX_LENGTH,
            truncation=True,
            padding="max_length",
            return_tensors="pt",
        )

    def __len__(self) -> int:
        return self.encodings["input_ids"].shape[0]

    def __getitem__(self, idx: int) -> dict:
        return {k: v[idx] for k, v in self.encodings.items()}


# ── helpers ───────────────────────────────────────────────────────────────────

def compute_metrics(y_true: list, y_pred: list) -> dict:
    """
    Compute accuracy, macro F1, weighted F1, and per-class metrics.

    Args:
        y_true: True string labels.
        y_pred: Predicted string labels.

    Returns:
        Dictionary of all metrics.
    """
    precision_per, recall_per, f1_per, support_per = precision_recall_fscore_support(
        y_true, y_pred, labels=LABELS
    )
    return {
        "accuracy":      round(accuracy_score(y_true, y_pred), 4),
        "macro_f1":      round(f1_score(y_true, y_pred, average="macro",    labels=LABELS), 4),
        "weighted_f1":   round(f1_score(y_true, y_pred, average="weighted", labels=LABELS), 4),
        "precision_per": precision_per,
        "recall_per":    recall_per,
        "f1_per":        f1_per,
        "support_per":   support_per,
    }


def run_baseline(X_test: list, y_test_labels: list,
                 X_train: list, y_train_labels: list) -> dict:
    """
    Retrain TF-IDF + LR on the same training split used by BioBERT, then
    evaluate on the same test split.

    Retraining from scratch (rather than loading the 172k-trained model)
    ensures both models see exactly the same training data — the only
    variable left is model architecture, which is what H2 tests.

    Args:
        X_test:         Cleaned test review strings.
        y_test_labels:  True test labels.
        X_train:        Cleaned training review strings (same split as BioBERT).
        y_train_labels: True training labels.

    Returns:
        Metrics dictionary.
    """
    logger.info("Retraining baseline on %d training samples (same split as BioBERT)...", len(X_train))
    logger.info("Applying lemmatization preprocessing to training set...")
    X_train_processed = [preprocess_text(text) for text in X_train]

    vectorizer = TfidfVectorizer(
        max_features=50_000, ngram_range=(1, 2), min_df=3, sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train_processed)

    model = LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs", multi_class="multinomial")
    model.fit(X_train_vec, y_train_labels)
    logger.info("Baseline retrained.")

    logger.info("Applying lemmatization preprocessing to test set (%d samples)...", len(X_test))
    X_test_processed = [preprocess_text(text) for text in X_test]
    X_test_vec = vectorizer.transform(X_test_processed)
    y_pred = [str(p) for p in model.predict(X_test_vec)]

    return compute_metrics(y_test_labels, y_pred)


def run_biobert(X_test: list, y_test_labels: list) -> dict:
    """
    Run the fine-tuned BioBERT model on the same test set.

    Args:
        X_test:        List of cleaned review strings.
        y_test_labels: True labels.

    Returns:
        Metrics dictionary.
    """
    logger.info("Loading BioBERT model from %s...", BIOBERT_MODEL_DIR)
    device    = torch.device("cpu")
    tokenizer = AutoTokenizer.from_pretrained(BIOBERT_MODEL_DIR)
    model     = AutoModelForSequenceClassification.from_pretrained(BIOBERT_MODEL_DIR)
    model.to(device)
    model.eval()

    dataset = InferenceDataset(X_test, tokenizer)
    loader  = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)

    logger.info("Running BioBERT predictions on %d samples...", len(X_test))
    all_preds = []
    with torch.no_grad():
        for batch in loader:
            batch   = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)
            preds   = torch.argmax(outputs.logits, dim=-1).cpu().numpy()
            all_preds.extend([ID2LABEL[i] for i in preds.tolist()])

    return compute_metrics(y_test_labels, all_preds)


def save_comparison_csv(baseline: dict, biobert: dict) -> None:
    """
    Save a side-by-side comparison CSV for the dissertation appendix.

    Args:
        baseline: Metrics dict for the baseline model.
        biobert:  Metrics dict for BioBERT.

    Returns:
        None. Saves to docs/results/model_comparison.csv.
    """
    os.makedirs(os.path.dirname(COMPARISON_CSV), exist_ok=True)
    rows = []
    for i, label in enumerate(LABELS):
        rows.append({
            "class":              label,
            "baseline_precision": round(float(baseline["precision_per"][i]), 4),
            "baseline_recall":    round(float(baseline["recall_per"][i]),    4),
            "baseline_f1":        round(float(baseline["f1_per"][i]),        4),
            "biobert_precision":  round(float(biobert["precision_per"][i]),  4),
            "biobert_recall":     round(float(biobert["recall_per"][i]),     4),
            "biobert_f1":         round(float(biobert["f1_per"][i]),         4),
            "f1_delta":           round(
                float(biobert["f1_per"][i]) - float(baseline["f1_per"][i]), 4
            ),
        })
    for metric_name, b_val, bb_val in [
        ("MACRO F1",    baseline["macro_f1"],    biobert["macro_f1"]),
        ("WEIGHTED F1", baseline["weighted_f1"], biobert["weighted_f1"]),
        ("ACCURACY",    baseline["accuracy"],    biobert["accuracy"]),
    ]:
        rows.append({
            "class": metric_name,
            "baseline_precision": "", "baseline_recall": "",
            "baseline_f1":        b_val,
            "biobert_precision":  "", "biobert_recall": "",
            "biobert_f1":         bb_val,
            "f1_delta":           round(bb_val - b_val, 4),
        })
    pd.DataFrame(rows).to_csv(COMPARISON_CSV, index=False)
    logger.info("Comparison CSV saved → %s", COMPARISON_CSV)


def save_comparison_chart(baseline: dict, biobert: dict) -> None:
    """
    Save a grouped bar chart comparing F1 scores for both models by class.

    This is the key visual for the dissertation (Figure 4.x / Table 4.3).

    Args:
        baseline: Metrics dict for the baseline model.
        biobert:  Metrics dict for BioBERT.

    Returns:
        None. Saves to docs/figures/model_comparison.png.
    """
    os.makedirs(os.path.dirname(COMPARISON_PNG), exist_ok=True)

    categories   = LABELS + ["MACRO AVG"]
    baseline_f1s = list(baseline["f1_per"]) + [baseline["macro_f1"]]
    biobert_f1s  = list(biobert["f1_per"])  + [biobert["macro_f1"]]

    x = np.arange(len(categories)); width = 0.35
    fig, ax = plt.subplots(figsize=(10, 6))
    bars1 = ax.bar(x - width/2, baseline_f1s, width,
                   label="TF-IDF + LR (Baseline)", color="#64748B", alpha=0.85)
    bars2 = ax.bar(x + width/2, biobert_f1s,  width,
                   label="BioBERT (Fine-tuned)", color="#0EA5E9", alpha=0.95)

    ax.set_xticks(x); ax.set_xticklabels(categories, fontsize=11)
    ax.set_ylim(0, 1.12)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(xmax=1, decimals=0))
    ax.set_title(
        "Model Comparison — F1 Score by Class\n"
        "TF-IDF + Logistic Regression  vs  BioBERT",
        fontsize=13, fontweight="bold", pad=14, color="#0F2944",
    )
    ax.set_xlabel("Sentiment Class", fontsize=11, labelpad=8)
    ax.set_ylabel("F1 Score",        fontsize=11, labelpad=8)
    ax.legend(fontsize=11)
    ax.grid(axis="y", linestyle="--", alpha=0.35)
    for bars in [bars1, bars2]:
        ax.bar_label(bars, fmt="%.2f", fontsize=9, padding=3)

    fig.tight_layout()
    fig.savefig(COMPARISON_PNG, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Comparison chart saved → %s", COMPARISON_PNG)


def print_comparison(baseline: dict, biobert: dict) -> None:
    """
    Print a formatted side-by-side comparison table to the terminal.

    Args:
        baseline: Metrics dict for the baseline model.
        biobert:  Metrics dict for BioBERT.

    Returns:
        None.
    """
    sep = "=" * 72
    print(f"\n{sep}")
    print("  MODEL COMPARISON  (Table 4.3 — H2 evidence)")
    print("  Fair comparison: both models trained on identical 80% split")
    print(sep)
    print(f"  {'Metric':<20} {'Baseline (TF-IDF+LR)':>20} {'BioBERT':>15} {'Delta':>10}")
    print(f"  {'-'*68}")

    for i, label in enumerate(LABELS):
        b  = float(baseline["f1_per"][i])
        bb = float(biobert["f1_per"][i])
        sign = "+" if bb >= b else ""
        print(f"  {label+' F1':<20} {b:>20.4f} {bb:>15.4f} {sign}{bb-b:>9.4f}")

    print(f"  {'-'*68}")
    for name, b_key, bb_key in [
        ("Macro F1",    "macro_f1",    "macro_f1"),
        ("Weighted F1", "weighted_f1", "weighted_f1"),
        ("Accuracy",    "accuracy",    "accuracy"),
    ]:
        b  = baseline[b_key]
        bb = biobert[bb_key]
        sign = "+" if bb >= b else ""
        print(f"  {name:<20} {b:>20.4f} {bb:>15.4f} {sign}{bb-b:>9.4f}")

    print(sep)
    h1 = "PASSED ✓" if biobert["macro_f1"] >= 0.80 else f"NOT MET (got {biobert['macro_f1']:.4f})"
    h2 = "PASSED ✓" if biobert["macro_f1"] > baseline["macro_f1"] else "NOT MET"
    print(f"\n  H1 (BioBERT macro F1 >= 80%):     {h1}")
    print(f"  H2 (BioBERT > Baseline macro F1): {h2}")
    print(sep + "\n")


def main() -> None:
    """
    Run the full Phase D2 model comparison.

    Loads the shared test set saved by train_biobert.py, runs both the
    baseline and BioBERT models on identical inputs, prints a comparison
    table, and saves the CSV and grouped bar chart.

    Returns:
        None.
    """
    logger.info("=== Phase D2: Model Comparison ===")

    if not os.path.exists(TEST_DATA_PKL):
        raise FileNotFoundError(
            f"Test data not found at: {TEST_DATA_PKL}\n"
            "Run 'python scripts/train_biobert.py' first to generate it."
        )

    logger.info("Loading shared train/test split from %s...", TEST_DATA_PKL)
    saved           = joblib.load(TEST_DATA_PKL)
    X_test          = saved["X_test"]
    y_test_labels   = saved["y_test_labels"]
    X_train         = saved["X_train"]
    y_train_labels  = saved["y_train_labels"]
    logger.info("Train: %d samples  |  Test: %d samples", len(X_train), len(X_test))

    baseline_metrics = run_baseline(X_test, y_test_labels, X_train, y_train_labels)
    biobert_metrics  = run_biobert(X_test,  y_test_labels)

    save_comparison_csv(baseline_metrics, biobert_metrics)
    save_comparison_chart(baseline_metrics, biobert_metrics)
    print_comparison(baseline_metrics, biobert_metrics)

    logger.info("Model comparison complete.")


if __name__ == "__main__":
    main()
