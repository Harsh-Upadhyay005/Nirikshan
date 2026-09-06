"""
Infrastructure Project Risk Prediction System

Predicts: (1) will a project be delayed, (2) will it go over budget,
(3) if so, by how much, (4) which risk segment does it belong to,
(5) generates a final alert list.

Run: python3 risk_prediction_project.py
Input:  Table6_Engineered.csv
Output: risk_alerts.csv, plus trained models in ./models/
"""

import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (classification_report, roc_auc_score, confusion_matrix,
                              mean_absolute_error, mean_squared_error, r2_score,
                              silhouette_score)
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from lightgbm import LGBMClassifier, LGBMRegressor

RANDOM_STATE = 42
os.makedirs("./models", exist_ok=True)

df = pd.read_csv("./data/processed/Table6_Engineered.csv")
print(f"Loaded {df.shape[0]} rows, {df.shape[1]} columns")


SAFE_FEATURES = [
    "ministry_freq_encoded",
    "category_freq_encoded",
    "agency_freq_encoded",
    "state_freq_encoded",
    "is_multi_state",
    "log_original_cost",
    "planned_duration_months",
    "approval_year",
    "project_age_months",
    "Physical Progress (%)",
    "log_cumulative_expenditure",
    "has_legacy_code",
    "has_pmgid",
    "missing_approval_date",
    "original_is_outlier",
    "cumulative_is_outlier",
]
print(f"\nUsing {len(SAFE_FEATURES)} leakage-safe features")

X = df[SAFE_FEATURES]
# LightGBM handles NaN natively — no imputation needed (matches the
# earlier decision to leave genuine missingness alone).


# PART 2 — STAGE 1: CLASSIFY DELAY RISK AND COST-OVERRUN RISK


def train_classifier(target_name, y):
    print(f"\n{'='*60}\nCLASSIFIER: {target_name}  (positive rate: {y.mean():.1%})\n{'='*60}")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    model = LGBMClassifier(random_state=RANDOM_STATE, verbose=-1)

    # 5-fold CV on the training set first — more reliable than one split
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc")
    print(f"5-fold CV ROC-AUC: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

    model.fit(X_train, y_train)
    proba = model.predict_proba(X_test)[:, 1]
    preds = model.predict(X_test)

    print(f"Test ROC-AUC: {roc_auc_score(y_test, proba):.3f}")
    print(classification_report(y_test, preds, digits=3))
    print("Confusion matrix:\n", confusion_matrix(y_test, preds))

    print("Top 5 features by importance:")
    imp = pd.Series(model.feature_importances_, index=SAFE_FEATURES).sort_values(ascending=False)
    print(imp.head(5))

    joblib.dump(model, f"./models/{target_name}_classifier.joblib")
    return model

delay_clf = train_classifier("delay", df["is_delayed"])
overrun_clf = train_classifier("cost_overrun", df["is_cost_overrun"])

#  
# PART 3 — STAGE 2: MAGNITUDE REGRESSION (hurdle model — only on the
# at-risk subset, per the design decision above)
#  

def train_regressor(target_name, y_full, mask):
    print(f"\n{'='*60}\nREGRESSOR: {target_name}  (n={mask.sum()} at-risk projects)\n{'='*60}")
    X_sub, y_sub = X[mask], y_full[mask]
    X_train, X_test, y_train, y_test = train_test_split(
        X_sub, y_sub, test_size=0.2, random_state=RANDOM_STATE
    )

    model = LGBMRegressor(random_state=RANDOM_STATE, verbose=-1)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"MAE: {mae:.2f} | RMSE: {rmse:.2f} | R2: {r2:.3f}")
    print(f"(for reference, mean {target_name} in this subset = {y_sub.mean():.2f})")

    joblib.dump(model, f"./models/{target_name}_regressor.joblib")
    return model

slippage_reg = train_regressor(
    "schedule_slippage_months", df["schedule_slippage_months"], df["is_delayed"] == 1
)
overrun_reg = train_regressor(
    "cost_overrun_pct", df["cost_overrun_pct"], df["is_cost_overrun"] == 1
)


# PART 4 — RISK CLUSTERING

print(f"\n{'='*60}\nRISK CLUSTERING\n{'='*60}")

cluster_features = ["log_original_cost", "planned_duration_months", "project_age_months",
                     "Physical Progress (%)", "log_cumulative_expenditure"]
X_cluster = df[cluster_features].fillna(df[cluster_features].median())
X_scaled = StandardScaler().fit_transform(X_cluster)

# pick k via silhouette score
best_k, best_score = 2, -1
for k in range(2, 7):
    km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}: silhouette={score:.3f}")
    if score > best_score:
        best_k, best_score = k, score

print(f"\nSelected k={best_k} (silhouette={best_score:.3f})")
kmeans = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=10)
df["cluster"] = kmeans.fit_predict(X_scaled)
joblib.dump(kmeans, "./models/risk_clusters.joblib")
print(f"\nSaved ./models/risk_clusters.joblib")
print(f"\nClustered {df['cluster'].nunique()} projects into {best_k} risk segments.")
# Label clusters by their ACTUAL outcome rates (interpretation only — not
# fed back into the clustering itself, which never saw is_delayed/is_cost_overrun)
profile = df.groupby("cluster").agg(
    n_projects=("Project Code", "count"),
    delay_rate=("is_delayed", "mean"),
    overrun_rate=("is_cost_overrun", "mean"),
    avg_cost=("Original Cost (Rs. Crore)", "mean"),
).round(3)
print("\nCluster profile:\n", profile)

risk_order = profile.sort_values(["delay_rate", "overrun_rate"], ascending=False).index
risk_labels = {cid: label for cid, label in zip(
    risk_order, ["Critical Risk", "High Risk", "Moderate Risk", "Low Risk", "Very Low Risk", "Minimal Risk"][:best_k]
)}
df["risk_segment"] = df["cluster"].map(risk_labels)
print("\nRisk segment labels assigned:", risk_labels)

# PART 5 — MERGE INTO FINAL RISK SCORE + ALERT LIST

print(f"\n{'='*60}\nGENERATING RISK ALERTS\n{'='*60}")

df["delay_probability"] = delay_clf.predict_proba(X)[:, 1]
df["cost_overrun_probability"] = overrun_clf.predict_proba(X)[:, 1]

# NOTE: 62.8% of all projects in this dataset are already delayed — that's
# the base rate, not a model artifact. A raw "probability > 0.5" alert
# would therefore flag most projects by construction and be useless as a
# notification signal (checked: threshold sweeps from 0.5 to 0.8 barely
# move the flagged share, because the prevalence itself is ~63%).
# Instead of "likely delayed", alert on EXPECTED SEVERITY — probability x
# magnitude x rupees at stake — and flag only the worst tail. This is a
# ranking problem, not a threshold problem.

df["predicted_slippage_months"] = slippage_reg.predict(X).round(1)
df["predicted_cost_overrun_pct"] = overrun_reg.predict(X).round(1)

df["expected_slippage_months"] = (df["delay_probability"] * df["predicted_slippage_months"]).round(1)
df["expected_overrun_value_cr"] = (
    df["cost_overrun_probability"] * (df["predicted_cost_overrun_pct"] / 100)
    * df["Original Cost (Rs. Crore)"]
).round(1)

# Composite score: z-normalize both severity measures so a project can
# rank highly on either "will run very late" or "will burn a lot of
# rupees", not just one axis.
def zscore(s):
    return (s - s.mean()) / s.std()

df["risk_score"] = (zscore(df["expected_slippage_months"]) + zscore(df["expected_overrun_value_cr"])) / 2

ALERT_PERCENTILE = 0.85  # flag the worst 15% by composite risk score
cutoff = df["risk_score"].quantile(ALERT_PERCENTILE)
df["needs_alert"] = df["risk_score"] >= cutoff

def build_reason(row):
    parts = [f"segment: {row['risk_segment']}"]
    if row["expected_slippage_months"] > 1:
        parts.append(f"expected delay ~{row['expected_slippage_months']:.0f} months "
                      f"({row['delay_probability']:.0%} likelihood)")
    if row["expected_overrun_value_cr"] > 1:
        parts.append(f"expected overrun ~₹{row['expected_overrun_value_cr']:.0f} cr "
                      f"({row['cost_overrun_probability']:.0%} likelihood)")
    return "; ".join(parts)

df["alert_reason"] = df.apply(build_reason, axis=1)

alerts = df[df["needs_alert"]].sort_values("risk_score", ascending=False)[[
    "Project Code", "Project Name", "Ministry", "State", "Original Cost (Rs. Crore)",
    "delay_probability", "expected_slippage_months",
    "cost_overrun_probability", "expected_overrun_value_cr",
    "risk_segment", "risk_score", "alert_reason"
]]

alerts.to_csv("./data/processed/risk_alerts.csv", index=False)
print(f"\n{len(alerts)} of {len(df)} projects flagged ({len(alerts)/len(df):.1%}) "
      f"— top {int((1-ALERT_PERCENTILE)*100)}% by composite risk score")
print(f"Total expected value at risk in the alert list: "
      f"₹{alerts['expected_overrun_value_cr'].sum():,.0f} crore")
print(f"Saved ./data/processed/risk_alerts.csv")
print("\nTop 5 highest-risk projects:")
print(alerts.head(5)[["Project Name", "Ministry", "alert_reason"]].to_string())


# PART 6 — SAVE EVERYTHING NEEDED TO SCORE A *NEW* PROJECT LATER

# The frequency-encoding maps and the cluster scaler only exist right now
# as columns computed on this training set. To score a brand-new project
# next month, we need these saved as lookup tables, not baked into a CSV.
print(f"Saved ./models/encoders.joblib — required alongside the 5 models to score new projects")
scaler = StandardScaler().fit(df[cluster_features].fillna(df[cluster_features].median()))

encoders = {
    "ministry_freq_map": df.groupby("Ministry")["ministry_freq_encoded"].first().to_dict(),
    "category_freq_map": df.groupby("Category")["category_freq_encoded"].first().to_dict(),
    "agency_freq_map":   df.groupby("Agency")["agency_freq_encoded"].first().to_dict(),
    "state_freq_map":    df.groupby("state_clean")["state_freq_encoded"].first().to_dict(),
    # fallback for a category never seen during training — treat it as rare
    "min_freq_fallback": min(
        df["ministry_freq_encoded"].min(), df["category_freq_encoded"].min(),
        df["agency_freq_encoded"].min(), df["state_freq_encoded"].min()
    ),
    "cluster_scaler": scaler,
    "cluster_feature_medians": df[cluster_features].median().to_dict(),
    "cluster_features": cluster_features,
    "safe_features": SAFE_FEATURES,
    "risk_labels": risk_labels,
    "reference_date": "2026-04-01",  # must match the date used for project_age_months
}
joblib.dump(encoders, "./models/encoders.joblib")
print("\nSaved ./models/encoders.joblib — required alongside the 5 models to score new projects")

