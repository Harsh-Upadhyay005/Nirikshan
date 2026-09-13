import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from ml_service import predict_risk

example_project = {
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

print("Testing ML prediction service...")
print("-" * 50)

try:
    result = predict_risk(example_project)
    print("✓ Prediction successful!")
    print(f"\nResults:")
    for key, value in result.items():
        print(f"  {key}: {value}")
except Exception as e:
    print(f"✗ Prediction failed: {e}")
    import traceback
    traceback.print_exc()
