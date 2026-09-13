import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
ml_src_path = current_dir.parent.parent / "ml" / "src"
sys.path.insert(0, str(ml_src_path))

from ml.predict import predict_risk as _predict_risk


def predict_risk(project_data: dict) -> dict:
    return _predict_risk(project_data)
