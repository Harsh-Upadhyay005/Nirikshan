import sys
from pathlib import Path

# Resolve the ml/src directory regardless of how the app is run:
#   - Locally:  <repo>/backend/src/ml_service.py  →  <repo>/ml/src
#   - Docker:   /app/src/ml_service.py             →  /app/ml/src
_here = Path(__file__).resolve().parent          # …/src
_ml_src = _here.parent / "ml" / "src"           # …/ml/src  (Docker layout)

if not _ml_src.exists():
    # Local dev fallback: repo root is two levels up from backend/src
    _ml_src = _here.parent.parent / "ml" / "src"

sys.path.insert(0, str(_ml_src))

from ml.predict import predict_risk as _predict_risk  # noqa: E402


def predict_risk(project_data: dict) -> dict:
    return _predict_risk(project_data)
