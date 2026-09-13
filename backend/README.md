# Nirikshan Backend (Unified Python/FastAPI)

Complete FastAPI backend for Nirikshan infrastructure risk monitoring platform with ML predictions, authentication, notifications, and all business logic.

## Overview

This is a **unified Python backend** that handles:
- Machine learning predictions and risk scoring
- User authentication and authorization (JWT)
- Role-based access control
- Notifications (in-app)
- Scheduled background jobs (alert checking)
- Project data management
- User subscriptions and preferences
- Project notes/comments

## Features

### ✅ ML Predictions
- 5 trained LightGBM models for risk prediction
- Real-time predictions via API
- Risk scoring and classification

### ✅ Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Three user roles:
  - **Admin**: Full access to all projects
  - **Ministry Officer**: Scoped to their ministry only
  - **Auditor**: Read-only access
- Automatic role-based filtering

### ✅ Notifications
- Scheduled background job (every 15 minutes)
- Checks for new/worsening alerts
- In-app notifications with read/unread tracking
- User-specific subscriptions (ministry, state, risk threshold)

### ✅ Business Logic
- User management
- Project notes/comments
- Alert subscriptions
- Dashboard aggregations

## Setup

### Prerequisites
- Python 3.13+
- PostgreSQL running
- ML models trained (in `../ml/models/`)

### Installation

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings

# Install dependencies
uv sync
# or
pip install -e .
```

### Running

Development mode:
```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The service will be available at: **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login (returns JWT token) |
| GET | `/auth/me` | Get current user info |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict` | Predict risk for new project |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List projects (filtered by role) |
| GET | `/api/v1/projects/{id}` | Get project details |
| POST | `/api/v1/projects` | Create project (admin only) |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/alerts` | List high-risk projects (filtered) |
| GET | `/api/v1/alerts/summary` | Alert statistics |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get user notifications |
| PATCH | `/api/v1/notifications/{id}/read` | Mark notification as read |
| POST | `/api/v1/notifications/mark-all-read` | Mark all as read |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | Get user subscriptions |
| POST | `/api/v1/subscriptions` | Create subscription |
| DELETE | `/api/v1/subscriptions/{id}` | Delete subscription |

### Project Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects/{code}/notes` | Get notes for project |
| POST | `/api/v1/projects/{code}/notes` | Add note to project |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | Aggregated dashboard data |

### Lookup Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ministries` | List ministries |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/agencies` | List agencies |
| GET | `/api/v1/states` | List states |

## Database Tables

This backend owns ALL tables:

**ML Data Tables**:
- `projects` - Project master data
- `project_snapshots` - Monthly project status
- `risk_predictions` - ML predictions
- `ministries`, `categories`, `agencies`, `states` - Lookup tables

**Application Tables**:
- `users` - User accounts and authentication
- `subscriptions` - User alert preferences
- `notifications` - In-app notifications
- `project_notes` - User comments on projects

## Authentication

### Signup Example

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "role": "admin"
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "ministry_name": null,
    "created_at": "2026-09-09T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token

```bash
# All protected endpoints require Authorization header
curl http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

### Admin
- Full access to all projects
- Can create/edit projects
- Can trigger predictions for any ministry

### Ministry Officer
- Scoped to their ministry only
- Can view only their ministry's projects
- Can trigger predictions for their ministry

### Auditor
- Read-only access
- Can view all projects
- Cannot create/edit or trigger predictions

## Background Jobs

### Alert Checker (Every 15 Minutes)

Automatically runs in the background to:
1. Fetch all current alerts from database
2. Check each user's subscriptions
3. Compare current alerts with previous state
4. Create notifications for:
   - New high-risk projects
   - Projects with worsening risk scores
5. Respects role-based and subscription filters

## Environment Variables

Key configuration (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://nirikshan_user:localdev123@localhost:5432/nirikshan

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=7

# ML Models
ML_MODELS_PATH=../ml/models

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Optional - for future email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py           # FastAPI app with all routes
│   ├── auth.py           # Authentication service
│   ├── config.py         # Configuration
│   ├── database.py       # Database connection
│   ├── models.py         # SQLAlchemy models (ALL tables)
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── ml_service.py     # ML model integration
│   └── scheduler.py      # Background jobs
├── Dockerfile
├── pyproject.toml
├── .env.example
├── .gitignore
└── README.md
```

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!","role":"admin"}'

# Test prediction (with token)
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

## Docker Deployment

```bash
# Start with Docker Compose
docker-compose up --build

# Services:
# - PostgreSQL: localhost:5432
# - Backend API: http://localhost:8000
```

## Development

When adding new endpoints:
1. Define Pydantic schema in `schemas.py`
2. Add database model in `models.py` (if needed)
3. Add CRUD operation in `crud.py` (if needed)
4. Create route in `main.py`
5. Add authentication/authorization decorators

## Troubleshooting

### "Module not found: ml"
The service imports from `../ml/src/ml/predict.py`. Make sure:
- ML models are trained: `cd ../ml && python src/ml/train.py`
- Path is correct in `src/ml_service.py`

### Database connection error
Ensure PostgreSQL is running:
```bash
docker-compose up -d postgres
```

### JWT errors
Check `JWT_SECRET` is set in `.env`

### Background scheduler not starting
Check logs: `docker-compose logs backend`

## Production Deployment

For production:
1. Set strong `JWT_SECRET` in `.env`
2. Use production database credentials
3. Run with multiple workers: `--workers 4`
4. Setup HTTPS (nginx reverse proxy)
5. Configure proper CORS origins
6. Enable email notifications (SMTP)
7. Setup monitoring and logging

## Technology Stack

- **Framework**: FastAPI 0.115+
- **ORM**: SQLAlchemy 2.0
- **Auth**: python-jose (JWT), passlib (bcrypt)
- **ML**: scikit-learn, LightGBM, pandas, numpy
- **Scheduler**: APScheduler 3.10
- **Database**: PostgreSQL 16
- **Python**: 3.13+

## Related Documentation

- [ML Pipeline](../ml/README.md) - Model training
- [Project Status](../PROJECT_STATUS.md) - Overall status
- [Quick Start](../QUICKSTART.md) - Get started quickly

## What Changed?

This backend consolidates what was previously split between:
- Python FastAPI (ML service)
- Node.js Express (application logic)

Now everything is in one Python service for simplicity and easier maintenance.

## License

See root LICENSE file.
