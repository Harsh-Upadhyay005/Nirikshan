"""
visualize.py — saare EDA aur model-evaluation plots ek jagah.
Notebook se import karke use karo:
    from visualize import *
    plot_cost_distribution(df)
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import (roc_curve, auc, confusion_matrix,
                              ConfusionMatrixDisplay)
from sklearn.decomposition import PCA

sns.set_style("whitegrid")

# Path setup: this file lives at ml/src/ml/visualize.py — go up to ml/ root.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
FIG_DIR = PROJECT_ROOT / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# EDA PLOTS
# ============================================================

def plot_cost_distribution(df, save=True):
    """Original Cost column: raw skew dikhata hai vs log-transform ke baad."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    sns.histplot(df["Original Cost (Rs. Crore)"], bins=50, ax=axes[0], color="#2563eb")
    axes[0].set_title("Original Cost (Rs. Crore) — raw")
    sns.histplot(df["log_original_cost"], bins=50, ax=axes[1], color="#16a34a")
    axes[1].set_title("log(Original Cost + 1) — after transform")
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "01_cost_distribution.png", dpi=120)
    plt.close()


def plot_physical_progress(df, save=True):
    """Physical Progress (%) column ka distribution."""
    plt.figure(figsize=(7, 4))
    sns.histplot(df["Physical Progress (%)"], bins=30, color="#f59e0b")
    plt.title("Physical Progress (%) distribution")
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "02_physical_progress.png", dpi=120)
    plt.close()


def plot_ministry_delay_rate(df, save=True):
    """Ministry column vs is_delayed — kis ministry mein delay rate zyada hai."""
    rate = df.groupby("ministry_grouped")["is_delayed"].mean().sort_values()
    plt.figure(figsize=(8, 5))
    rate.plot(kind="barh", color="#dc2626")
    plt.xlabel("Delay rate")
    plt.title("Ministry-wise delay rate (is_delayed column)")
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "03_ministry_delay_rate.png", dpi=120)
    plt.close()


def plot_correlation_heatmap(df, features, save=True):
    """Saare numeric features ka correlation — redundant features pakadne ke liye."""
    plt.figure(figsize=(10, 8))
    corr = df[features].corr()
    sns.heatmap(corr, annot=False, cmap="coolwarm", center=0)
    plt.title("Feature correlation heatmap")
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "04_correlation_heatmap.png", dpi=120)
    plt.close()


def plot_outlier_boxplot(df, save=True):
    """Original Cost column ke outliers, Ministry ke hisaab se."""
    top_ministries = df["ministry_grouped"].value_counts().head(6).index
    subset = df[df["ministry_grouped"].isin(top_ministries)]
    plt.figure(figsize=(10, 5))
    sns.boxplot(data=subset, x="ministry_grouped", y="Original Cost (Rs. Crore)")
    plt.yscale("log")
    plt.xticks(rotation=30, ha="right")
    plt.title("Original Cost outliers by Ministry (log scale)")
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "05_cost_outliers_boxplot.png", dpi=120)
    plt.close()


# ============================================================
# MODEL EVALUATION PLOTS
# ============================================================

def plot_confusion_matrix(y_true, y_pred, title, filename, save=True):
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(cm, display_labels=["Not delayed/overrun", "Delayed/Overrun"])
    fig, ax = plt.subplots(figsize=(5, 5))
    disp.plot(ax=ax, cmap="Blues", colorbar=False)
    ax.set_title(title)
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / f"{filename}.png", dpi=120)
    plt.close()


def plot_roc_curve(y_true, y_proba, title, filename, save=True):
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    roc_auc = auc(fpr, tpr)
    plt.figure(figsize=(5, 5))
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}", color="#2563eb")
    plt.plot([0, 1], [0, 1], linestyle="--", color="gray")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(title)
    plt.legend()
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / f"{filename}.png", dpi=120)
    plt.close()


def plot_feature_importance(model, feature_names, title, filename, save=True):
    imp = pd.Series(model.feature_importances_, index=feature_names).sort_values()
    plt.figure(figsize=(7, 6))
    imp.plot(kind="barh", color="#16a34a")
    plt.title(title)
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / f"{filename}.png", dpi=120)
    plt.close()


def plot_predicted_vs_actual(y_true, y_pred, title, filename, save=True):
    plt.figure(figsize=(6, 6))
    plt.scatter(y_true, y_pred, alpha=0.4, color="#f59e0b")
    lims = [min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())]
    plt.plot(lims, lims, "--", color="gray")
    plt.xlabel("Actual")
    plt.ylabel("Predicted")
    plt.title(title)
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / f"{filename}.png", dpi=120)
    plt.close()


def plot_clusters_pca(X_scaled, cluster_labels, risk_segment_names, save=True):
    """5 cluster features ko PCA se 2D mein la ke plot karo, taaki dekh sako
    clusters visually kitne separate hain (features khud 5D hain, dikha nahi sakte)."""
    pca = PCA(n_components=2)
    coords = pca.fit_transform(X_scaled)
    plt.figure(figsize=(7, 6))
    palette = sns.color_palette("Set1", n_colors=len(set(cluster_labels)))
    for i, seg in enumerate(sorted(set(risk_segment_names))):
        mask = np.array(risk_segment_names) == seg
        plt.scatter(coords[mask, 0], coords[mask, 1], label=seg, alpha=0.5, color=palette[i])
    plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.0%} variance)")
    plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.0%} variance)")
    plt.title("Risk clusters (PCA projection)")
    plt.legend()
    plt.tight_layout()
    if save: plt.savefig(FIG_DIR / "10_risk_clusters_pca.png", dpi=120)
    plt.close()