# Quick Start Guide

## For Developers - First Time Setup

### 1. Prerequisites

```bash
# Check installations
python --version  # Need 3.13+
docker --version
docker-compose --version
git --version
```

### 2. Clone and Setup (5 minutes)

```bash
# Clone repository
git clone <repository-url>
cd Nirikshan

# Create environment file
cp .env.example .env

# Generate secure secrets
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(64))"
# Copy output and paste into .env file
```

### 3. Start Development Environment

```bash
# Start all services
docker-compose up -d

# Check everything is running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Verify Installation

```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs

# Create first user
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123!",
    "role": "admin"
  }'
```

## For Production Deployment

See **DEPLOYMENT.md** for complete guide.

Quick checklist:
1. Set `ENV=production` in `.env`
2. Generate 64-char JWT secret
3. Set strong database password
4. Configure CORS for production domain
5. Set up HTTPS/SSL
6. Configure monitoring

## Running Tests

```bash
cd backend

# Install dependencies
pip install -e ".[dev]"

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_auth.py::TestPasswordHashing::test_password_hashing -v
```

## Common Commands

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart backend only
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build backend

# View logs
docker-compose logs -f backend

# Enter backend container
docker-compose exec backend bash
```

### Database
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U nirikshan_user -d nirikshan

# Backup database
docker-compose exec postgres pg_dump -U nirikshan_user nirikshan > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nirikshan_user nirikshan < backup.sql
```

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes to code
# Edit files...

# 3. Run tests
cd backend && pytest tests/ -v

# 4. Commit and push
git add .
git commit -m "Add feature X"
git push origin feature/my-feature

# 5. Create pull request on GitHub
# CI will automatically run tests
```

## Project Structure

```
Nirikshan/
├── backend/              # Python FastAPI backend
│   ├── src/
│   │   ├── main.py      # Main application entry
│   │   ├── auth.py      # Authentication logic
│   │   ├── config.py    # Configuration
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── crud.py      # Database operations
│   │   └── ml_service.py # ML predictions
│   ├── tests/           # Test suite
│   └── pyproject.toml   # Dependencies
├── ml/                  # ML pipeline
│   ├── models/          # Trained models
│   ├── data/            # Data files
│   └── src/ml/
│       ├── train.py     # Model training
│       └── predict.py   # Prediction logic
├── docker-compose.yml   # Docker services
└── .env                 # Environment variables (not in git)
```

## API Endpoints Quick Reference

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login and get token
- `GET /auth/me` - Get current user info

### Projects
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/{id}` - Get project details
- `POST /api/v1/projects` - Create project (admin only)

### Predictions
- `POST /api/v1/predict` - Predict project risk

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications/{id}/read` - Mark as read

### Subscriptions
- `GET /api/v1/subscriptions` - Get subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `DELETE /api/v1/subscriptions/{id}` - Delete subscription

## Authentication Example

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPassword123!"}' \
  | jq -r '.token')

# 2. Use token in requests
curl -X GET http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing .env file → cp .env.example .env
# - Wrong JWT_SECRET → Check .env has valid value
# - Database not ready → Wait 10 seconds and retry
```

### Tests failing
```bash
# Make sure test environment variables are set
export DATABASE_URL="sqlite:///:memory:"
export JWT_SECRET="test-secret-key-min-32-chars"
export CORS_ORIGINS='["http://localhost:3000"]'
export FRONTEND_URL="http://localhost:3000"
export ENV="testing"

# Run tests
pytest tests/ -v
```

### Database connection error
```bash
# Check postgres is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres pg_isready

# Restart postgres
docker-compose restart postgres
```

## Environment Variables Reference

### Required (No Defaults)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 chars, use random string
- `CORS_ORIGINS` - JSON array of allowed origins
- `FRONTEND_URL` - Frontend URL
- `ENV` - development/production/testing

### Optional
- `JWT_ALGORITHM` - Default: HS256
- `JWT_EXPIRY_DAYS` - Default: 7
- `ML_MODELS_PATH` - Default: ../ml/models
- `SMTP_HOST` - For email notifications
- `SMTP_PORT` - Default: 587
- `SMTP_USER` - Email username
- `SMTP_PASSWORD` - Email password

## Resources

- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **Full Documentation:** README.md
- **Security Guide:** SECURITY.md
- **Deployment Guide:** DEPLOYMENT.md
- **Production Audit:** PRODUCTION_READINESS_AUDIT.md

## Getting Help

- Check logs: `docker-compose logs -f backend`
- Read documentation in repository
- Open GitHub issue for bugs
- Email security@nirikshan.gov.in for security issues
