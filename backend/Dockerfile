FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Install Python dependencies (cached layer — only rebuilds when pyproject.toml changes)
COPY backend/pyproject.toml backend/README.md ./
RUN uv pip install --system --no-cache \
    fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary "psycopg[binary]" \
    "pydantic>=2.0" pydantic-settings "python-jose[cryptography]" \
    bcrypt python-multipart joblib numpy pandas \
    scikit-learn lightgbm apscheduler slowapi httpx sib-api-v3-sdk

# Copy backend application source
COPY backend/src ./src

# Copy ML Python source (ml/src/ml/predict.py + friends)
COPY ml/src ./ml/src

# Copy trained model artefacts (.joblib files)
COPY ml/models ./ml/models

# Copy processed data for seeding the database
COPY ml/data/processed ./ml/data/processed

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
