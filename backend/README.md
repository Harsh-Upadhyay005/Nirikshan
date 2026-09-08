# Nirikshan Backend API

FastAPI backend for the Nirikshan infrastructure risk monitoring platform.

## Setup

### Prerequisites
- Python 3.13+
- PostgreSQL database running (via Docker Compose)
- ML models trained (in `../ml/models/`)

### Installation

```bash
cd backend

# Create .env file
cp .env.example .env

# Install dependencies using uv
uv sync

# Or using pip
pip install -e .
```

### Database Setup

Make sure PostgreSQL is running:
```bash
cd ..
docker-compose up -d
```

The database schema will be automatically created when you start the FastAPI server.

### Running the Server

Development mode:
```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Or using Python directly:
```bash
python -m src.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /health` - Check API and database status

### Predictions
- `POST /api/v1/predict` - Predict risk for a new project (no database required)
- `POST /api/v1/projects/{project_id}/predict` - Predict risk for existing project

### Projects
- `GET /api/v1/projects` - List all projects (with pagination)
- `GET /api/v1/projects/{project_id}` - Get project details
- `POST /api/v1/projects` - Create new project

### Alerts
- `GET /api/v1/alerts` - List high-risk projects
- `GET /api/v1/alerts/summary` - Get alert statistics

### Lookup Data
- `GET /api/v1/ministries` - List all ministries
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/agencies` - List all agencies
- `GET /api/v1/states` - List all states

## Example Usage

### Predict Risk for New Project

```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
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
    "has_pmgid": 1
  }'
```

Response:
```json
{
  "delay_probability": 0.873,
  "expected_slippage_months": 14.2,
  "cost_overrun_probability": 0.654,
  "expected_overrun_value_cr": 125.3,
  "risk_segment": "High Risk",
  "needs_attention": true
}
```

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── config.py         # Configuration settings
│   ├── database.py       # Database connection
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   └── ml_service.py     # ML model integration
├── pyproject.toml        # Dependencies
├── .env.example          # Environment template
└── README.md
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ML_MODELS_PATH` - Path to trained models directory
- `CORS_ORIGINS` - Allowed frontend origins
- `SECRET_KEY` - JWT secret (for future auth)

## Next Steps

1. Load existing data: Run `python ../ml/src/ml/load_data.py`
2. Test predictions: Use `/docs` interactive API
3. Build frontend dashboard
4. Add authentication middleware
5. Deploy to production
