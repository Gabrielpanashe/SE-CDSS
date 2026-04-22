"""
Phase D2 — BioBERT Fine-Tuning for SE-CDSS dissertation (Table 4.2).

Fine-tunes dmis-lab/biobert-base-cased-v1.2 on a stratified 5,000-row sample
of the UCI Drug Review dataset using the same seed=42 split as Phase D1.

What is fine-tuning?
    BioBERT is a BERT model already trained on 18 GB of biomedical text from
    PubMed and PMC. Fine-tuning means we take those pre-learned weights and
    train for a few extra epochs on our specific task (sentiment classification),
    so the model adapts its biomedical knowledge to drug review text.

Hardware note:
    This script runs on CPU (Intel Iris Xe does not support CUDA).
    With 5,000 samples and 3 epochs, expect approximately 90-120 minutes.
    The sample size can be adjusted via the SAMPLE_SIZE constant below.
"""

import logging
import os
import sys
import time

import joblib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer, get_scheduler

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.preprocessing.text_normalization import clean_text, preprocess_text

# ── tuneable constants ────────────────────────────────────────────────────────
RANDOM_SEED: int   = 42        # same as D1 — ensures reproducibility everywhere
SAMPLE_SIZE: int   = 10_000    # total rows sampled from combined UCI dataset
TEST_SIZE: float   = 0.20      # 80 / 20 split — identical ratio to D1
BATCH_SIZE: int    = 8         # safe for CPU; reduce to 4 if memory errors appear
MAX_LENGTH: int    = 128       # token limit per review (BioBERT max is 512)
NUM_EPOCHS: int    = 3         # standard for fine-tuning; more epochs = diminishing returns
LEARNING_RATE: float = 2e-5   # standard BioBERT fine-tuning learning rate

MODEL_NAME: str    = "dmis-lab/biobert-base-cased-v1.2"

# label order must be consistent across D1 and D2
LABELS: list = ["NEGATIVE", "NEUTRAL", "POSITIVE"]
LABEL2ID: dict = {label: i for i, label in enumerate(LABELS)}   # NEGATIVE→0, NEUTRAL→1, POSITIVE→2
ID2LABEL: dict = {i: label for i, label in enumerate(LABELS)}

# ── output paths ──────────────────────────────────────────────────────────────
BIOBERT_MODEL_DIR: str  = os.path.join(config.PROJECT_ROOT, "models", "biobert_sentiment")
DOCS_FIGURES: str       = os.path.join(config.PROJECT_ROOT, "docs", "figures")
DOCS_RESULTS: str       = os.path.join(config.PROJECT_ROOT, "docs", "results")
CONFUSION_PNG: str      = os.path.join(DOCS_FIGURES, "biobert_confusion_matrix.png")
PER_CLASS_PNG: str      = os.path.join(DOCS_FIGURES, "biobert_per_class_metrics.png")
METRICS_CSV: str        = os.path.join(DOCS_RESULTS, "biobert_metrics.csv")
TEST_DATA_PKL: str      = os.path.join(DOCS_RESULTS, "biobert_test_data.pkl")

# ── logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── suppress noisy HuggingFace warnings we don't need ─────────────────────────
logging.getLogger("transformers.modeling_utils").setLevel(logging.ERROR)


# ── Dataset class ─────────────────────────────────────────────────────────────

class DrugReviewDataset(Dataset):
    """
    PyTorch Dataset wrapping tokenised drug reviews.

    PyTorch requires data to be wrapped in a Dataset so the DataLoader can
    fetch batches efficiently.  Each item is a dict of tensors the model
    expects: input_ids, attention_mask, token_type_ids, and label.

    Args:
        texts:     List of preprocessed review strings.
        labels:    List of integer class indices (0=NEGATIVE, 1=NEUTRAL, 2=POSITIVE).
        tokenizer: Loaded HuggingFace tokenizer.
    """

    def __init__(self, texts: list, labels: list, tokenizer) -> None:
        self.encodings = tokenizer(
            texts,
            max_length=MAX_LENGTH,
            truncation=True,
            padding="max_length",
            return_tensors="pt",
        )
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self) -> int:
        """Return the number of samples in the dataset."""
        return len(self.labels)

    def __getitem__(self, idx: int) -> dict:
        """Return one tokenised sample with its label."""
        return {
            "input_ids":      self.encodings["input_ids"][idx],
            "attention_mask": self.encodings["attention_mask"][idx],
            "token_type_ids": self.encodings["token_type_ids"][idx],
            "labels":         self.labels[idx],
        }


# ── data loading ──────────────────────────────────────────────────────────────

def assign_sentiment_label(rating: float) -> str:
    """
    Convert numeric drug rating (1–10) to a sentiment class string.

    Args:
        rating: Numeric rating from UCI dataset.

    Returns:
        'POSITIVE', 'NEUTRAL', or 'NEGATIVE'.
    """
    if rating >= 7:
        return "POSITIVE"
    if rating >= 4:
        return "NEUTRAL"
    return "NEGATIVE"


def load_sample() -> pd.DataFrame:
    """
    Load, combine, and sample the UCI Drug Review dataset.

    We take a stratified sample of SAMPLE_SIZE rows so that the class
    proportions (POSITIVE ~66%, NEGATIVE ~22%, NEUTRAL ~12%) are preserved.
    Using seed=42 makes the sample identical across any re-run.

    Returns:
        Sampled DataFrame with 'review' and 'sentiment' columns.
    """
    logger.info("Loading raw datasets...")
    train_df = pd.read_csv(config.TRAIN_RAW_PATH)
    test_df  = pd.read_csv(config.TEST_RAW_PATH)
    combined = pd.concat([train_df, test_df], ignore_index=True)
    combined = combined.dropna(subset=["review", "rating"])
    combined["sentiment"] = combined["rating"].apply(assign_sentiment_label)

    # stratified sample: sample from each class proportionally
    # We sample from each class separately then concatenate, which is more
    # reliable across pandas versions than groupby().apply().
    class_frames = []
    for sentiment_class, group_df in combined.groupby("sentiment"):
        n = round(SAMPLE_SIZE * len(group_df) / len(combined))
        class_frames.append(group_df.sample(n=n, random_state=RANDOM_SEED))
    sample = pd.concat(class_frames, ignore_index=True)

    logger.info(
        "Sampled %s rows (target=%s)  |  class breakdown:\n%s",
        f"{len(sample):,}", f"{SAMPLE_SIZE:,}",
        sample["sentiment"].value_counts().to_string(),
    )
    return sample


def apply_preprocessing(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply the SE-CDSS text cleaning pipeline to review text.

    Note: BioBERT has its own tokenizer and can handle raw text well.
    We still apply clean_text() to strip HTML entities, but we skip
    stopword removal and lemmatization — BioBERT benefits from seeing
    the full context of sentences, which lemmatization would destroy.

    Args:
        df: DataFrame with a 'review' column.

    Returns:
        DataFrame with 'clean_review' added; empty rows removed.
    """
    logger.info("Cleaning text (HTML entities, normalisation)...")
    df = df.copy()
    # clean_text only — BioBERT tokenizer handles the rest contextually
    df["clean_review"] = df["review"].apply(clean_text)
    df = df[df["clean_review"].str.strip() != ""]
    logger.info("After cleaning: %s rows", f"{len(df):,}")
    return df


def build_splits(df: pd.DataFrame):
    """
    Create the 80/20 stratified train/test split.

    This uses the identical parameters as D1 (TEST_SIZE=0.20, RANDOM_SEED=42)
    for a fair comparison.  The test set produced here is saved to disk so
    compare_models.py can run the baseline model on the same data.

    Args:
        df: Preprocessed DataFrame with 'clean_review' and 'sentiment'.

    Returns:
        Tuple of (X_train, X_test, y_train_ids, y_test_ids, y_test_labels).
    """
    texts  = df["clean_review"].tolist()
    labels = [LABEL2ID[s] for s in df["sentiment"].tolist()]

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels,
        test_size=TEST_SIZE,
        random_state=RANDOM_SEED,
        stratify=labels,
    )

    y_test_labels = [ID2LABEL[i] for i in y_test]   # string labels for metrics

    logger.info(
        "Split  |  train: %s  |  test: %s",
        f"{len(X_train):,}", f"{len(X_test):,}",
    )
    return X_train, X_test, y_train, y_test, y_test_labels


# ── training loop ─────────────────────────────────────────────────────────────

def train(model, train_loader: DataLoader, num_epochs: int, device: torch.device) -> None:
    """
    Run the fine-tuning training loop.

    Steps each epoch:
      1. Forward pass — compute logits and cross-entropy loss
      2. Backward pass — compute gradients (how much each weight contributed to the error)
      3. Optimizer step — adjust weights in the direction that reduces error
      4. Scheduler step — gradually reduce learning rate (prevents overshooting)

    Args:
        model:        The BioBERT classification model.
        train_loader: DataLoader providing batches of tokenised reviews.
        num_epochs:   Number of complete passes through the training data.
        device:       torch.device (cpu in our case).

    Returns:
        None.
    """
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)

    total_steps = len(train_loader) * num_epochs
    scheduler = get_scheduler(
        "linear",
        optimizer=optimizer,
        num_warmup_steps=int(0.1 * total_steps),   # warm-up 10% of steps
        num_training_steps=total_steps,
    )

    model.train()
    model.to(device)

    for epoch in range(1, num_epochs + 1):
        epoch_loss = 0.0
        t_epoch_start = time.time()

        for step, batch in enumerate(train_loader, 1):
            batch = {k: v.to(device) for k, v in batch.items()}

            outputs = model(**batch)
            loss    = outputs.loss

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()

            epoch_loss += loss.item()

            if step % 50 == 0 or step == len(train_loader):
                avg = epoch_loss / step
                elapsed = (time.time() - t_epoch_start) / 60
                remaining = (elapsed / step) * (len(train_loader) - step)
                logger.info(
                    "Epoch %d/%d  step %d/%d  loss=%.4f  "
                    "elapsed=%.1fmin  remaining~%.1fmin",
                    epoch, num_epochs, step, len(train_loader),
                    avg, elapsed, remaining,
                )

        logger.info(
            "Epoch %d done  |  avg_loss=%.4f  |  time=%.1f min",
            epoch, epoch_loss / len(train_loader),
            (time.time() - t_epoch_start) / 60,
        )


# ── evaluation ────────────────────────────────────────────────────────────────

def evaluate(model, test_loader: DataLoader, device: torch.device,
             y_test_labels: list) -> dict:
    """
    Run the trained model on the held-out test set and compute all metrics.

    Args:
        model:         Trained BioBERT model.
        test_loader:   DataLoader for the test set.
        device:        torch.device.
        y_test_labels: True string labels (e.g. 'NEGATIVE') for the test set.

    Returns:
        Dictionary of all scalar metrics and per-class breakdowns.
    """
    logger.info("Evaluating on test set...")
    model.eval()
    all_preds = []

    with torch.no_grad():
        for batch in test_loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)
            preds   = torch.argmax(outputs.logits, dim=-1).cpu().numpy()
            all_preds.extend(preds.tolist())

    y_pred_labels = [ID2LABEL[i] for i in all_preds]

    accuracy    = accuracy_score(y_test_labels, y_pred_labels)
    macro_f1    = f1_score(y_test_labels, y_pred_labels, average="macro",    labels=LABELS)
    weighted_f1 = f1_score(y_test_labels, y_pred_labels, average="weighted", labels=LABELS)
    precision_per, recall_per, f1_per, support_per = precision_recall_fscore_support(
        y_test_labels, y_pred_labels, labels=LABELS
    )
    report = classification_report(y_test_labels, y_pred_labels, labels=LABELS, digits=4)

    return {
        "accuracy":              accuracy,
        "macro_f1":              macro_f1,
        "weighted_f1":           weighted_f1,
        "precision_per":         precision_per,
        "recall_per":            recall_per,
        "f1_per":                f1_per,
        "support_per":           support_per,
        "y_pred":                y_pred_labels,
        "classification_report": report,
    }


# ── output helpers ────────────────────────────────────────────────────────────

def save_confusion_matrix(y_true: list, y_pred: list) -> None:
    """
    Save a styled confusion matrix heatmap for the BioBERT model.

    Args:
        y_true: True string labels.
        y_pred: Predicted string labels.

    Returns:
        None. Saves to docs/figures/biobert_confusion_matrix.png.
    """
    os.makedirs(DOCS_FIGURES, exist_ok=True)
    cm  = confusion_matrix(y_true, y_pred, labels=LABELS)
    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=LABELS, yticklabels=LABELS,
        linewidths=0.5, linecolor="white", ax=ax,
        annot_kws={"size": 13, "weight": "bold"},
    )
    ax.set_title(
        "BioBERT Model — Confusion Matrix\n(dmis-lab/biobert-base-cased-v1.2)",
        fontsize=13, fontweight="bold", pad=14, color="#0F2944",
    )
    ax.set_xlabel("Predicted Label", fontsize=11, labelpad=8)
    ax.set_ylabel("True Label",      fontsize=11, labelpad=8)
    fig.tight_layout()
    fig.savefig(CONFUSION_PNG, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Confusion matrix saved → %s", CONFUSION_PNG)


def save_per_class_bar_chart(metrics: dict) -> None:
    """
    Save a grouped bar chart of per-class precision, recall, and F1.

    Args:
        metrics: Dictionary returned by evaluate().

    Returns:
        None. Saves to docs/figures/biobert_per_class_metrics.png.
    """
    os.makedirs(DOCS_FIGURES, exist_ok=True)
    x = np.arange(len(LABELS)); width = 0.25
    colors = ["#0EA5E9", "#0F2944", "#22C55E"]
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar(x - width, metrics["precision_per"], width, label="Precision", color=colors[0])
    ax.bar(x,          metrics["recall_per"],    width, label="Recall",    color=colors[1])
    ax.bar(x + width,  metrics["f1_per"],        width, label="F1",        color=colors[2])
    ax.set_xticks(x); ax.set_xticklabels(LABELS, fontsize=11)
    ax.set_ylim(0, 1.05)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(xmax=1, decimals=0))
    ax.set_title(
        "BioBERT Model — Per-Class Metrics\n(dmis-lab/biobert-base-cased-v1.2)",
        fontsize=13, fontweight="bold", pad=14, color="#0F2944",
    )
    ax.set_xlabel("Sentiment Class", fontsize=11, labelpad=8)
    ax.set_ylabel("Score",           fontsize=11, labelpad=8)
    ax.legend(fontsize=10)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    for bars in ax.containers:
        ax.bar_label(bars, fmt="%.2f", fontsize=8, padding=2)
    fig.tight_layout()
    fig.savefig(PER_CLASS_PNG, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Per-class bar chart saved → %s", PER_CLASS_PNG)


def save_metrics_csv(metrics: dict) -> None:
    """
    Save all evaluation metrics to CSV (same schema as baseline_metrics.csv).

    Args:
        metrics: Dictionary returned by evaluate().

    Returns:
        None. Saves to docs/results/biobert_metrics.csv.
    """
    os.makedirs(DOCS_RESULTS, exist_ok=True)
    rows = []
    for i, label in enumerate(LABELS):
        rows.append({
            "model":     "BioBERT (dmis-lab/biobert-base-cased-v1.2)",
            "class":     label,
            "precision": round(float(metrics["precision_per"][i]), 4),
            "recall":    round(float(metrics["recall_per"][i]),    4),
            "f1":        round(float(metrics["f1_per"][i]),        4),
            "support":   int(metrics["support_per"][i]),
        })
    rows.append({
        "model": "BioBERT (dmis-lab/biobert-base-cased-v1.2)",
        "class": "OVERALL (macro)", "precision": "", "recall": "",
        "f1": round(metrics["macro_f1"], 4),
        "support": sum(int(s) for s in metrics["support_per"]),
    })
    rows.append({
        "model": "BioBERT (dmis-lab/biobert-base-cased-v1.2)",
        "class": "OVERALL (weighted)", "precision": "", "recall": "",
        "f1": round(metrics["weighted_f1"], 4), "support": "",
    })
    rows.append({
        "model": "BioBERT (dmis-lab/biobert-base-cased-v1.2)",
        "class": "ACCURACY", "precision": "", "recall": "",
        "f1": round(metrics["accuracy"], 4), "support": "",
    })
    pd.DataFrame(rows).to_csv(METRICS_CSV, index=False)
    logger.info("Metrics CSV saved → %s", METRICS_CSV)


def print_summary(metrics: dict) -> None:
    """
    Print a clean summary table matching the D1 output format (dissertation Table 4.2).

    Args:
        metrics: Dictionary returned by evaluate().

    Returns:
        None.
    """
    sep = "=" * 60
    print(f"\n{sep}")
    print("  PHASE D2 — BioBERT RESULTS  (Table 4.2)")
    print(sep)
    print(f"  Model        : BioBERT  (dmis-lab/biobert-base-cased-v1.2)")
    print(f"  Sample       : {SAMPLE_SIZE:,} rows  |  split 80/20  |  seed = {RANDOM_SEED}")
    print(f"  Epochs       : {NUM_EPOCHS}  |  lr = {LEARNING_RATE}  |  batch = {BATCH_SIZE}")
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
    print(f"    {CONFUSION_PNG}")
    print(f"    {PER_CLASS_PNG}")
    print(f"    {METRICS_CSV}")
    print(sep + "\n")


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    """
    Run the full Phase D2 BioBERT fine-tuning pipeline.

    Steps:
        1. Sample 5,000 stratified rows from the UCI dataset (seed=42)
        2. Clean text (HTML entities, normalisation)
        3. Stratified 80/20 train/test split
        4. Tokenise with BioBERT tokenizer
        5. Build PyTorch DataLoaders
        6. Load BioBERT with a fresh 3-class classification head
        7. Fine-tune for 3 epochs
        8. Evaluate on held-out test set
        9. Save model, metrics, confusion matrix, per-class chart
       10. Print summary (dissertation Table 4.2)

    Returns:
        None.
    """
    logger.info("=== Phase D2: BioBERT Fine-Tuning ===")

    device = torch.device("cpu")
    logger.info("Device: %s  (no CUDA on Intel Iris Xe — CPU training)", device)

    # 1. data
    sample_df = load_sample()
    sample_df = apply_preprocessing(sample_df)
    X_train, X_test, y_train, y_test, y_test_labels = build_splits(sample_df)

    # save test data so compare_models.py can reuse the exact same test set
    os.makedirs(DOCS_RESULTS, exist_ok=True)
    joblib.dump(
        {"X_test": X_test, "y_test_labels": y_test_labels},
        TEST_DATA_PKL,
    )
    logger.info("Test data saved for compare_models.py → %s", TEST_DATA_PKL)

    # 2. tokenizer
    logger.info("Loading BioBERT tokenizer from %s...", MODEL_NAME)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    # 3. datasets + loaders
    logger.info("Tokenising %s training and %s test samples...", len(X_train), len(X_test))
    train_dataset = DrugReviewDataset(X_train, y_train, tokenizer)
    test_dataset  = DrugReviewDataset(X_test,  y_test,  tokenizer)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader  = DataLoader(test_dataset,  batch_size=BATCH_SIZE, shuffle=False)
    logger.info("Tokenisation complete.")

    # 4. model — load BioBERT with a fresh 3-class head
    # The "UNEXPECTED keys" warning is normal: those are MLM layers from
    # pre-training that we don't need.  "MISSING" classifier weights are
    # expected — they are freshly initialised for our 3-class task.
    logger.info("Loading BioBERT model with 3-class classification head...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True,   # suppresses the size mismatch warning
    )

    total_params = sum(p.numel() for p in model.parameters())
    logger.info("BioBERT parameters: %s million", f"{total_params/1e6:.1f}")

    # 5. train
    t_total = time.time()
    logger.info(
        "Starting training: %d epochs | batch=%d | lr=%s | samples=%d",
        NUM_EPOCHS, BATCH_SIZE, LEARNING_RATE, SAMPLE_SIZE,
    )
    logger.info(
        "Estimated time: %.0f – %.0f minutes (CPU-only)",
        (len(train_loader) * NUM_EPOCHS * 3.5) / 60,
        (len(train_loader) * NUM_EPOCHS * 5.0) / 60,
    )
    train(model, train_loader, NUM_EPOCHS, device)
    logger.info("Total training time: %.1f minutes", (time.time() - t_total) / 60)

    # 6. evaluate
    metrics = evaluate(model, test_loader, device, y_test_labels)

    # 7. save model + tokenizer
    os.makedirs(BIOBERT_MODEL_DIR, exist_ok=True)
    model.save_pretrained(BIOBERT_MODEL_DIR)
    tokenizer.save_pretrained(BIOBERT_MODEL_DIR)
    logger.info("Model + tokenizer saved → %s", BIOBERT_MODEL_DIR)

    # 8. save outputs
    save_confusion_matrix(y_test_labels, metrics["y_pred"])
    save_per_class_bar_chart(metrics)
    save_metrics_csv(metrics)

    print_summary(metrics)
    logger.info("Phase D2 complete.")


if __name__ == "__main__":
    main()
