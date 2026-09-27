# Nirikshan ML Pipeline

The `ml` directory contains the offline data preparation, feature engineering,
model training, visualization, and database loading code used by the FastAPI
backend.

## Layout

```text
ml/
	src/ingestion/        PDF extraction utilities
	src/ml/               Feature engineering, training, prediction, and loading
	models/               Trained .joblib artefacts used by the backend
	data/raw_data/        Source reports
	data/interim/         Extracted intermediate files
	data/processed/       Processed data used for database loading
	schema.sql            PostgreSQL schema/reference tables
```

## Setup

```bash
cd ml
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirement.txt
```

The backend expects trained models in `ml/models/`. Keep the existing model
filenames when replacing artefacts, because `backend/src/ml_service.py` loads
them by name.

## Common Operations

```bash
# Train models after preparing the processed dataset
python src/ml/train.py

# Load processed project data into the configured PostgreSQL database
python src/ml/load_data.py
```

The backend Docker image copies `ml/src`, `ml/models`, and
`ml/data/processed` into the image. For Docker or Render, set
`ML_MODELS_PATH=/app/ml/models`.
