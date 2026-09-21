FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Install Python dependencies first (layer-cached separately from code)
COPY pyproject.toml README.md ./
RUN uv pip install --system --no-cache \
    fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary \
    "pydantic>=2.0" pydantic-settings "python-jose[cryptography]" \
    "passlib[bcrypt]" python-multipart joblib numpy pandas \
    scikit-learn lightgbm apscheduler slowapi httpx sib-api-v3-sdk

# Copy backend application code
COPY src ./src

# Copy ML source code (ml/src/ml/predict.py + friends)
COPY ml/src ./ml/src

# Copy trained model artefacts (the .joblib files)
COPY ml/models ./ml/models

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
