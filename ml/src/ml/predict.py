"""
predict.py — score a brand-new project (not in the training CSV) using the
saved models + encoders. This is the file you import into another
application; it never touches Table6_Engineered.csv.

Usage:
    from predict import predict_risk

    new_project = {
        "ministry": "Ministry of Road Transport & Highways",
        "category": "National Highways",
        "agency": "National Highways Authority of India [NHAI]",
        "state": "Maharashtra",
        "is_multi_state": 0,
        "original_cost_cr": 850.0,
        "approval_date": "2024-03-01",   # YYYY-MM-DD
        "start_date": "2024-06-01",
        "target_doc": "2027-06-01",
        "physical_progress_pct": 22.0,
        "cumulative_expenditure_cr": 140.0,
        "has_legacy_code": 0,
        "has_pmgid": 1,
    }
    result = predict_risk(new_project)
    print(result)
"""

import joblib
import numpy as np
import pandas as pd

MODELS_DIR = "models"

_delay_clf = joblib.load(f"{MODELS_DIR}/delay_classifier.joblib")
_overrun_clf = joblib.load(f"{MODELS_DIR}/cost_overrun_classifier.joblib")
_slippage_reg = joblib.load(f"{MODELS_DIR}/schedule_slippage_months_regressor.joblib")
_overrun_reg = joblib.load(f"{MODELS_DIR}/cost_overrun_pct_regressor.joblib")
_kmeans = joblib.load(f"{MODELS_DIR}/risk_clusters.joblib")
_enc = joblib.load(f"{MODELS_DIR}/encoders.joblib")

REFERENCE_DATE = pd.Timestamp(_enc["reference_date"])


def _freq_encode(value, freq_map):
    """Look up a category's training-set frequency; unseen categories get
    the lowest observed frequency (treat anything new as rare, not average —
    an unknown ministry/agency shouldn't be assumed to behave like a
    common one)."""
    return freq_map.get(value, _enc["min_freq_fallback"])


def prepare_features(raw: dict) -> pd.DataFrame:
    """Turn a raw project dict into the exact 16-column feature row the
    models were trained on. This function is the single source of truth
    for feature construction — reuse it everywhere you call the models
    from, don't re-derive features ad hoc elsewhere in your app."""

    approval_date = pd.Timestamp(raw["approval_date"]) if raw.get("approval_date") else pd.NaT
    start_date = pd.Timestamp(raw["start_date"])
    target_doc = pd.Timestamp(raw["target_doc"])

    planned_duration_months = (
        (target_doc.year - approval_date.year) * 12 + (target_doc.month - approval_date.month)
        if pd.notna(approval_date) else np.nan
    )
    project_age_months = (
        (REFERENCE_DATE.year - start_date.year) * 12 + (REFERENCE_DATE.month - start_date.month)
    )

    row = {
        "ministry_freq_encoded": _freq_encode(raw["ministry"], _enc["ministry_freq_map"]),
        "category_freq_encoded": _freq_encode(raw["category"], _enc["category_freq_map"]),
        "agency_freq_encoded": _freq_encode(raw["agency"], _enc["agency_freq_map"]),
        "state_freq_encoded": _freq_encode(raw["state"], _enc["state_freq_map"]),
        "is_multi_state": int(raw.get("is_multi_state", 0)),
        "log_original_cost": np.log1p(raw["original_cost_cr"]),
        "planned_duration_months": planned_duration_months,
        "approval_year": approval_date.year if pd.notna(approval_date) else np.nan,
        "project_age_months": project_age_months,
        "Physical Progress (%)": raw["physical_progress_pct"],
        "log_cumulative_expenditure": np.log1p(raw["cumulative_expenditure_cr"]),
        "has_legacy_code": int(raw.get("has_legacy_code", 0)),
        "has_pmgid": int(raw.get("has_pmgid", 0)),
        "missing_approval_date": int(pd.isna(approval_date)),
        "original_is_outlier": 0,   # unknown for a single new project; default 0
        "cumulative_is_outlier": 0,
    }
    return pd.DataFrame([row])[_enc["safe_features"]]


def predict_risk(raw: dict) -> dict:
    X = prepare_features(raw)

    delay_p = float(_delay_clf.predict_proba(X)[:, 1][0])
    overrun_p = float(_overrun_clf.predict_proba(X)[:, 1][0])
    slippage = float(_slippage_reg.predict(X)[0])
    overrun_pct = float(_overrun_reg.predict(X)[0])

    expected_slippage = round(delay_p * slippage, 1)
    expected_overrun_value = round(overrun_p * (overrun_pct / 100) * raw["original_cost_cr"], 1)

    # cluster assignment uses a DIFFERENT feature set (cluster_features),
    # built the same way it was during training
    cf = _enc["cluster_features"]
    medians = _enc["cluster_feature_medians"]
    cluster_row = {
        "log_original_cost": np.log1p(raw["original_cost_cr"]),
        "planned_duration_months": X["planned_duration_months"].iloc[0]
            if pd.notna(X["planned_duration_months"].iloc[0]) else medians["planned_duration_months"],
        "project_age_months": X["project_age_months"].iloc[0],
        "Physical Progress (%)": raw["physical_progress_pct"],
        "log_cumulative_expenditure": np.log1p(raw["cumulative_expenditure_cr"]),
    }
    X_cluster = pd.DataFrame([cluster_row])[cf]
    X_cluster_scaled = _enc["cluster_scaler"].transform(X_cluster)
    cluster_id = int(_kmeans.predict(X_cluster_scaled)[0])
    risk_segment = _enc["risk_labels"].get(cluster_id, f"cluster_{cluster_id}")

    return {
        "delay_probability": round(delay_p, 3),
        "expected_slippage_months": expected_slippage,
        "cost_overrun_probability": round(overrun_p, 3),
        "expected_overrun_value_cr": expected_overrun_value,
        "risk_segment": risk_segment,
        "needs_attention": bool(delay_p > 0.7 or overrun_p > 0.5 or risk_segment == "Critical Risk"),
    }


if __name__ == "__main__":
    example = {
        "ministry": "Ministry of Road Transport & Highways",
        "category": "National Highways",
        "agency": "National Highways Authority of India [NHAI]",
        "state": "Maharashtra",
        "is_multi_state": 0,
        "original_cost_cr": 850.0,
        "approval_date": "2024-03-01",
        "start_date": "2024-06-01",
        "target_doc": "2027-06-01",
        "physical_progress_pct": 22.0,
        "cumulative_expenditure_cr": 140.0,
        "has_legacy_code": 0,
        "has_pmgid": 1,
    }
    result = predict_risk(example)
    print(result)