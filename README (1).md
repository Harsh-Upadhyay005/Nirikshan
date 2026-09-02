# Project Sentinel AI

> **AI-Powered Predictive Analytics and Early Warning System for Infrastructure Project Monitoring**

Project Sentinel AI is an open-source decision-support platform designed for the **MoSPI IPMD / PAIMANA infrastructure monitoring use case**. It transforms historical and continuously updated infrastructure project data into predictive insights for identifying **cost overruns, time overruns, execution risks, emerging implementation challenges, and projects requiring early intervention**.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Solution Overview](#solution-overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Machine Learning Strategy](#machine-learning-strategy)
- [Data Pipeline](#data-pipeline)
- [Feature Engineering](#feature-engineering)
- [Model Evaluation](#model-evaluation)
- [Risk Scoring Framework](#risk-scoring-framework)
- [Early Warning System](#early-warning-system)
- [Explainable AI](#explainable-ai)
- [CUF Field Assessment](#cuf-field-assessment)
- [Project Structure](#project-structure)
- [API Design](#api-design)
- [Database Design](#database-design)
- [Development Roadmap](#development-roadmap)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

# Problem Statement

The Infrastructure & Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation (MoSPI), monitors Central Sector Infrastructure Projects costing ₹150 crore and above.

Historically, project information was maintained through the **Online Computerised Monitoring System (OCMS)**. This ecosystem was later modernized into the **Project Assessment, Infrastructure Monitoring and Analytics for Nation-building (PAIMANA)** portal.

The available ecosystem contains valuable information related to:

- Original and revised project cost
- Expenditure
- Implementation timelines
- Physical progress
- Financial progress
- Milestones
- Project status
- Implementing agencies
- Ministries and sectors
- Historical cost overruns
- Historical time overruns

The current monitoring process is primarily descriptive:

> It tells decision-makers what has already happened.

The goal of this project is to move infrastructure monitoring towards:

> **Descriptive Monitoring → Predictive Monitoring → Prescriptive Decision Support**

The system should identify projects likely to experience problems **before the problems become critical**, allowing policymakers and monitoring agencies to prioritize interventions.

---

# Objectives

## Primary Objectives

1. Predict the probability and magnitude of **cost overruns**.
2. Predict the probability and expected duration of **time overruns**.
3. Generate a **project-level risk score**.
4. Detect early warning signals from changing project performance.
5. Explain the major factors contributing to each prediction.
6. Rank projects according to intervention priority.
7. Compare AI/ML performance against conventional statistical methods.
8. Assess the predictive value of existing Common Upload Form (CUF) fields.
9. Build an AI-powered monitoring dashboard.
10. Provide an LLM-based interface for querying project intelligence.

---

# Solution Overview

```text
                        DATA SOURCES
                             │
             ┌───────────────┴────────────────┐
             │                                │
             ▼                                ▼
      Historical OCMS Data              PAIMANA Data
             │                                │
             └───────────────┬────────────────┘
                             ▼
                    DATA INGESTION
                             │
                             ▼
                   CLEANING + VALIDATION
                             │
                             ▼
                   FEATURE ENGINEERING
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Cost Prediction  Delay Prediction  Risk Analysis
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                     MODEL EVALUATION
                             │
                             ▼
                    EXPLAINABLE AI
                       SHAP / Drivers
                             │
                             ▼
                   EARLY WARNING ENGINE
                             │
                             ▼
                  FASTAPI PREDICTION API
                             │
                             ▼
                AI MONITORING DASHBOARD
                             │
                             ▼
              LLM PROJECT INTELLIGENCE ASSISTANT
```

---

# Core Features

## 1. Cost Overrun Prediction

The system predicts:

- Probability of cost overrun
- Estimated final project cost
- Expected overrun amount
- Expected overrun percentage
- Major drivers of cost escalation

### Example

```text
Project: Highway Development Project

Current Approved Cost: ₹1,100 Cr
Predicted Final Cost: ₹1,420 Cr

Predicted Overrun: ₹320 Cr
Overrun Probability: 87%

Risk Level: HIGH
```

---

## 2. Time Overrun Prediction

The system predicts whether a project is likely to miss its target completion date.

### Outputs

- Delay probability
- Predicted delay duration
- Forecasted completion date
- Schedule risk level
- Major schedule risk drivers

### Example

```text
Original Completion: March 2027
AI Forecasted Completion: May 2028

Predicted Delay: 14 Months
Delay Probability: 91%

Risk Level: CRITICAL
```

---

## 3. Project Risk Score

Every project receives a normalized risk score from **0 to 100**.

| Score | Level | Meaning |
|---|---|---|
| 0-30 | Low | Normal monitoring |
| 31-60 | Medium | Watch closely |
| 61-80 | High | Intervention recommended |
| 81-100 | Critical | Immediate attention required |

The score combines multiple dimensions:

```text
Overall Risk Score
        │
        ├── Cost Risk
        ├── Schedule Risk
        ├── Progress Risk
        ├── Milestone Risk
        ├── Financial-Physical Mismatch
        └── Historical Similar-Project Risk
```

Initial formula:

```text
Overall Risk =
0.30 × Cost Risk
+ 0.30 × Schedule Risk
+ 0.15 × Progress Risk
+ 0.10 × Milestone Risk
+ 0.10 × Financial Risk
+ 0.05 × Historical Risk
```

> These weights should later be calibrated using historical data instead of being treated as permanent assumptions.

---

## 4. Early Warning Alert System

The platform continuously evaluates project data and creates alerts when emerging risk patterns are detected.

### Example Alert

```text
CRITICAL ALERT

Project Risk Score: 89/100

Warning Signals:
- Physical progress is 22% behind expected progress
- Expenditure is increasing faster than physical progress
- Four milestones have been missed
- Monthly progress has declined for three reporting periods

AI Prediction:
- Cost Overrun Probability: 88%
- Time Overrun Probability: 93%

Recommended Action:
Immediate project-level review required
```

---

## 5. Explainable AI

Predictions must be explainable.

A government monitoring system should not simply return:

```text
Risk Score: 87
```

It should explain why.

### Example

```text
WHY IS THIS PROJECT HIGH RISK?

1. Low Physical Progress             +24%
2. High Expenditure Rate             +21%
3. Previous Cost Revision            +17%
4. Delayed Critical Milestones       +14%
5. Sector Historical Risk             +9%
```

Recommended tools:

- SHAP
- Feature importance
- Partial dependence analysis
- Statistical correlation analysis

---

## 6. Benchmarking and Comparative Analytics

Projects can be compared against historically similar projects.

Comparison dimensions:

- Sector
- Ministry
- Implementing agency
- Cost range
- Project duration
- Geographic region
- Project type

### Example

```text
Current Project Delay Risk: 91st Percentile

Interpretation:
The project has a higher schedule risk than approximately
91% of comparable historical projects.
```

---

## 7. Cost Escalation Driver Analysis

The system identifies factors associated with likely cost escalation.

Potential drivers:

- Repeated project cost revisions
- Slow physical progress
- Delayed implementation
- High expenditure velocity
- Financial-physical progress mismatch
- Milestone delays
- Historical sector-level patterns

---

## 8. AI Project Intelligence Assistant

An LLM-based assistant provides a natural language interface over approved project data and prediction outputs.

### Example Queries

```text
Which projects require immediate attention?

Show projects with delay probability above 85%.

Why is Project ABC classified as high risk?

Which sector has the highest predicted cost escalation?

Compare this project with similar historical projects.
```

The LLM is an interface layer, not the main predictive engine.

```text
User Question
      │
      ▼
LLM
      │
      ├── Structured Database Queries
      ├── ML Prediction API
      ├── Risk Analysis Engine
      └── Project Knowledge Base
      │
      ▼
Grounded Response
```

---

# Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
Axios
Recharts
React Router
```

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
```

## Machine Learning

```text
Pandas
NumPy
Scikit-learn
XGBoost
CatBoost
LightGBM
Optuna
SHAP
Joblib
```

## Database

```text
PostgreSQL
```

Optional for high-volume monthly historical data:

```text
TimescaleDB
```

## AI / LLM

```text
Ollama
Qwen / Llama
LangChain or LlamaIndex
```

## DevOps

```text
Docker
Docker Compose
Nginx
GitHub Actions
```

All major components should preferably remain open-source.

---

# Machine Learning Strategy

The problem specifically requires assessing whether AI/ML provides gains over conventional methods.

Therefore, the project must not train only one ML model.

## Baseline Models

### Cost Prediction

```text
Linear Regression
Ridge Regression
Lasso Regression
```

### Delay Classification

```text
Logistic Regression
```

## Machine Learning Models

```text
Random Forest
XGBoost
CatBoost
LightGBM
```

## Model Selection Pipeline

```text
Dataset
   │
   ▼
Train / Validation / Test Split
   │
   ▼
Statistical Baseline Models
   │
   ▼
Machine Learning Models
   │
   ▼
Hyperparameter Optimization
   │
   ▼
Performance Comparison
   │
   ▼
Explainability Analysis
   │
   ▼
Best Model Registration
```

---

# Data Pipeline

```text
RAW DATA
   │
   ▼
Schema Validation
   │
   ▼
Missing Value Analysis
   │
   ▼
Duplicate Removal
   │
   ▼
Date Standardization
   │
   ▼
Currency / Numeric Validation
   │
   ▼
Outlier Analysis
   │
   ▼
Feature Engineering
   │
   ▼
Feature Store / Processed Dataset
   │
   ▼
ML Training
   │
   ▼
Model Registry
   │
   ▼
Prediction Service
```

---

# Feature Engineering

Raw CUF fields alone may not provide the strongest predictive performance.

Derived features should be created from historical project records.

## Recommended Features

### 1. Cost Growth Rate

```text
(Revised Cost - Original Cost) / Original Cost
```

### 2. Expenditure Percentage

```text
Cumulative Expenditure / Current Approved Cost
```

### 3. Physical-Financial Gap

```text
Financial Progress % - Physical Progress %
```

A large mismatch can indicate inefficient expenditure or execution issues.

### 4. Project Age

```text
Current Date - Start Date
```

### 5. Schedule Progress Gap

```text
Expected Progress - Actual Physical Progress
```

### 6. Progress Velocity

```text
Change in Physical Progress / Number of Months
```

### 7. Required Progress Velocity

```text
Remaining Progress / Remaining Planned Duration
```

### 8. Velocity Gap

```text
Actual Progress Velocity - Required Progress Velocity
```

### 9. Cost Revision Count

Number of times project cost has been revised.

### 10. Milestone Delay Rate

```text
Delayed Milestones / Total Milestones
```

### 11. Recent Progress Trend

Rolling trend across recent monthly reporting periods.

### 12. Historical Sector Risk

Historical average overrun behavior for comparable projects.

### 13. Implementing Agency Historical Performance

Aggregated historical performance, computed carefully to avoid data leakage.

---

# Preventing Data Leakage

This is critical.

Do not use future information to predict the past.

For example, when predicting whether a project will experience a delay at month 12:

```text
VALID:
Data available up to month 12

INVALID:
Actual final completion date
Future expenditure
Future progress
Final revised cost
```

Training data should represent the information genuinely available at the prediction point.

For historical monthly records:

```text
Project Snapshot at Time T
        │
        ▼
Features Available at Time T
        │
        ▼
Predict Future Outcome
```

Recommended validation approaches:

- Temporal train/test split
- TimeSeriesSplit where appropriate
- Project-level grouping to prevent the same project's future snapshots leaking into training

---

# Model Evaluation

## Regression Metrics

For final cost / overrun prediction:

```text
MAE
RMSE
R²
MAPE / sMAPE where appropriate
```

## Classification Metrics

For risk and delay prediction:

```text
Precision
Recall
F1 Score
ROC-AUC
PR-AUC
Confusion Matrix
```

## Important Evaluation Principle

For an early warning system, **recall can be more important than raw accuracy**.

Missing a genuinely high-risk project may be more costly than generating an additional warning.

Therefore evaluate:

```text
High-Risk Recall
False Negative Rate
Lead Time Before Actual Failure
Precision at Top K
```

---

# Benchmark: Statistical vs ML

Example experiment:

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| Linear Regression | TBD | TBD | TBD |
| Ridge Regression | TBD | TBD | TBD |
| Random Forest | TBD | TBD | TBD |
| XGBoost | TBD | TBD | TBD |
| CatBoost | TBD | TBD | TBD |

For classification:

| Model | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|
| Logistic Regression | TBD | TBD | TBD | TBD |
| Random Forest | TBD | TBD | TBD | TBD |
| XGBoost | TBD | TBD | TBD | TBD |
| CatBoost | TBD | TBD | TBD | TBD |

The project should report actual experimental results rather than fabricated performance claims.

---

# CUF Field Assessment

The problem explicitly asks for assessment of existing CUF fields versus additional variables.

The recommended experiment has three stages.

## Experiment A: CUF Fields Only

```text
Existing CUF Fields
        │
        ▼
Model A
        │
        ▼
Performance Metrics
```

## Experiment B: CUF + Engineered Features

```text
CUF Fields
      +
Derived Features
      │
      ▼
Model B
      │
      ▼
Performance Metrics
```

## Experiment C: CUF + External Variables

Where legally and practically available:

```text
CUF Fields
      +
Derived Features
      +
External Variables
      │
      ▼
Model C
      │
      ▼
Performance Metrics
```

Potential external variables:

- Weather and extreme events
- Inflation indicators
- Commodity price indices
- Land acquisition status
- Litigation status
- Contractor performance data
- Regulatory delays

Final output:

```text
Predictive Performance Contribution

CUF Only              X%
CUF + Engineered      Y%
CUF + External        Z%
```

This identifies which additional data fields could improve future monitoring systems.

---

# Risk Scoring Framework

```text
                    OVERALL RISK
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
   Cost Risk        Time Risk        Execution Risk
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                 Progress Risk
                         │
                         ▼
                 Milestone Risk
                         │
                         ▼
               Historical Risk Context
```

The score should combine:

1. Model probabilities
2. Current project anomalies
3. Historical comparative patterns
4. Rule-based critical conditions

Example:

```text
Risk Score = 82/100

Cost Risk:          85
Schedule Risk:      91
Progress Risk:      72
Milestone Risk:     80
Historical Risk:    61
```

---

# Early Warning System

Alerts should be generated based on a combination of:

## Model-Based Signals

```text
Delay Probability > Threshold
Cost Overrun Probability > Threshold
Risk Score > Threshold
```

## Trend-Based Signals

```text
Physical Progress Declining
Progress Velocity Below Required Rate
Expenditure Increasing Abnormally
Financial-Physical Gap Increasing
Repeated Milestone Delays
```

## Example Alert Levels

| Level | Condition | Action |
|---|---|---|
| INFO | Minor deviation | Continue monitoring |
| WARNING | Emerging risk | Review required |
| HIGH | Strong risk signal | Intervention recommended |
| CRITICAL | Multiple severe signals | Immediate attention |

---

# Project Structure

```text
project-sentinel-ai/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   ├── projects/
│   │   │   └── alerts/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── lib/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── projects.py
│   │   │   │   ├── predictions.py
│   │   │   │   ├── risks.py
│   │   │   │   ├── alerts.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── assistant.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── logging.py
│   │   │
│   │   ├── models/
│   │   │   ├── project.py
│   │   │   ├── milestone.py
│   │   │   ├── monthly_progress.py
│   │   │   └── prediction.py
│   │   │
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   ├── data/
│   │   ├── raw/
│   │   ├── interim/
│   │   └── processed/
│   │
│   ├── notebooks/
│   │   ├── 01_eda.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   └── 03_model_experiments.ipynb
│   │
│   ├── src/
│   │   ├── ingestion/
│   │   ├── preprocessing/
│   │   ├── features/
│   │   ├── training/
│   │   ├── evaluation/
│   │   ├── explainability/
│   │   └── inference/
│   │
│   ├── models/
│   ├── configs/
│   └── requirements.txt
│
├── assistant/
│   ├── prompts/
│   ├── tools/
│   └── rag/
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── architecture.md
│   ├── data_dictionary.md
│   ├── model_card.md
│   └── api_documentation.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# API Design

## Projects

```http
GET /api/v1/projects
```

Returns paginated projects.

```http
GET /api/v1/projects/{project_id}
```

Returns detailed project information.

---

## Predictions

```http
POST /api/v1/predictions/cost
```

Predict cost overrun.

```http
POST /api/v1/predictions/delay
```

Predict time overrun.

```http
GET /api/v1/predictions/{project_id}
```

Get the latest prediction for a project.

---

## Risk

```http
GET /api/v1/risks/{project_id}
```

Returns project risk score and contributing factors.

```http
GET /api/v1/risks/high-priority
```

Returns projects ranked by intervention priority.

---

## Alerts

```http
GET /api/v1/alerts
```

Returns active alerts.

```http
POST /api/v1/alerts/evaluate
```

Evaluates current projects and generates alerts.

---

## Analytics

```http
GET /api/v1/analytics/portfolio
```

Returns portfolio-level statistics.

```http
GET /api/v1/analytics/sector-comparison
```

Compares sectors.

```http
GET /api/v1/analytics/model-performance
```

Returns statistical versus ML model evaluation.

---

## AI Assistant

```http
POST /api/v1/assistant/chat
```

Example request:

```json
{
  "message": "Which projects require immediate attention?"
}
```

---

# Database Design

## projects

```text
id
project_code
name
ministry
sector
implementing_agency
state
original_cost
current_cost
start_date
original_completion_date
current_completion_date
status
created_at
updated_at
```

## project_monthly_progress

```text
id
project_id
reporting_month
cumulative_expenditure
physical_progress
financial_progress
remarks
```

## milestones

```text
id
project_id
name
planned_date
actual_date
status
```

## predictions

```text
id
project_id
prediction_date
cost_overrun_probability
predicted_final_cost
predicted_overrun_amount
delay_probability
predicted_delay_months
forecasted_completion_date
model_version
```

## risk_scores

```text
id
project_id
calculated_at
overall_score
cost_risk
schedule_risk
progress_risk
milestone_risk
historical_risk
risk_level
```

## alerts

```text
id
project_id
type
severity
message
status
created_at
resolved_at
```

---

# Dashboard Modules

## Portfolio Overview

Display:

```text
Total Projects
Total Portfolio Cost
Critical Projects
High-Risk Projects
Average Cost Risk
Average Schedule Risk
Active Alerts
```

## Risk Map

Visualize projects by:

- Geography
- Sector
- Risk level

## Priority Intervention Table

```text
Project | Sector | Risk Score | Cost Risk | Delay Risk | Recommended Action
```

## Project Detail Page

Show:

```text
Project Summary
Cost Timeline
Physical vs Financial Progress
Milestones
Predictions
Risk Score
SHAP Explanations
Historical Comparison
Alerts
AI Assistant
```

---

# Development Roadmap

## Phase 1: Data Foundation

- [ ] Define data schema
- [ ] Create data dictionary
- [ ] Import sample historical data
- [ ] Build data validation pipeline
- [ ] Clean missing values
- [ ] Standardize dates and numerical fields

## Phase 2: Exploratory Data Analysis

- [ ] Analyze sector-wise project performance
- [ ] Analyze historical cost overruns
- [ ] Analyze time overruns
- [ ] Detect feature correlations
- [ ] Identify missing data patterns
- [ ] Create baseline visualizations

## Phase 3: Feature Engineering

- [ ] Cost growth features
- [ ] Progress gap features
- [ ] Velocity features
- [ ] Milestone features
- [ ] Historical benchmark features
- [ ] Temporal features

## Phase 4: Baseline Models

- [ ] Linear Regression
- [ ] Ridge Regression
- [ ] Logistic Regression

## Phase 5: ML Models

- [ ] Random Forest
- [ ] XGBoost
- [ ] CatBoost
- [ ] Hyperparameter optimization
- [ ] Model comparison

## Phase 6: Explainability

- [ ] SHAP integration
- [ ] Feature importance
- [ ] Project-level explanations

## Phase 7: Risk and Alert Engine

- [ ] Risk score calculation
- [ ] Alert rules
- [ ] Priority ranking
- [ ] Trend detection

## Phase 8: Backend

- [ ] FastAPI setup
- [ ] PostgreSQL integration
- [ ] Prediction endpoints
- [ ] Risk endpoints
- [ ] Analytics endpoints

## Phase 9: Frontend

- [ ] Dashboard
- [ ] Project explorer
- [ ] Risk ranking
- [ ] Alert center
- [ ] Prediction charts
- [ ] Explainability views

## Phase 10: LLM Assistant

- [ ] Tool calling
- [ ] Database query tools
- [ ] Prediction retrieval
- [ ] Grounded responses
- [ ] Prompt guardrails

## Phase 11: Deployment

- [ ] Dockerize services
- [ ] Configure environment variables
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Deploy database
- [ ] Add CI/CD

---

# Installation

## Prerequisites

Install:

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Docker and Docker Compose, optional
- Git

---

## Clone Repository

```bash
git clone https://github.com/your-username/project-sentinel-ai.git
cd project-sentinel-ai
```

---

## Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the environment.

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file based on `.env.example`.

```env
APP_ENV=development

DATABASE_URL=postgresql://postgres:password@localhost:5432/project_sentinel

API_V1_PREFIX=/api/v1

ML_MODEL_PATH=../ml/models

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5

CORS_ORIGINS=http://localhost:5173
```

Never commit real credentials.

---

# Docker Setup

Start the complete local stack:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

Suggested services:

```text
frontend
backend
postgres
ml-worker
ollama
```

---

# Deployment

Recommended architecture:

```text
                Internet
                    │
                    ▼
              Reverse Proxy
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    Frontend                FastAPI API
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
         PostgreSQL        ML Models         LLM Service
```

Possible deployment choices:

- Frontend: Vercel or self-hosted
- Backend: Docker-based server
- Database: PostgreSQL
- ML service: Docker/FastAPI
- LLM: Ollama on an appropriate server

For sensitive government-grade data, deployment should be evaluated against security and hosting requirements before production use.

---

# Important ML Principles

## Do not fabricate accuracy

Model performance must be based on actual experiments.

Bad:

```text
Our model has 98% accuracy.
```

unless real evaluation proves it.

Good:

```text
The selected model achieved the best performance on a held-out
test set using temporal validation.
```

---

## Do not use future information

All predictions must only use information available at the time of prediction.

---

## Handle class imbalance

High-risk projects may be less common.

Consider:

```text
Class weights
SMOTE only within training data
Threshold tuning
Precision-Recall evaluation
PR-AUC
```

Never apply oversampling before splitting train and test data.

---

## Use temporal validation

Random splitting can create unrealistic results when historical records are time-dependent.

Prefer chronological validation.

---

## Focus on lead time

A model that predicts a delay one week before completion is less useful than a slightly less accurate model that warns six months earlier.

Therefore measure:

```text
Prediction Accuracy
+
Early Warning Lead Time
```

---

# Documentation Requirements

The final project should document:

- Data sources
- Data schema
- Missing value strategy
- Feature definitions
- Model assumptions
- Training methodology
- Validation methodology
- Performance metrics
- Known limitations
- Bias and risk considerations
- Model version
- Deployment architecture

Recommended files:

```text
docs/data_dictionary.md
docs/model_card.md
docs/architecture.md
docs/api_documentation.md
```

---

# Future Improvements

- Real-time API integration with project monitoring systems
- Automated monthly retraining
- Drift detection
- Advanced time-series forecasting
- Graph-based relationships between projects, agencies and contractors
- Geographic risk visualization
- Satellite or remote-sensing integration where relevant and legally available
- Document intelligence for project reports
- Multi-agent analytical workflows
- Intervention recommendation learning
- Scenario simulation:
  - What happens if progress velocity improves by 20%?
  - What happens if expenditure continues at the current rate?
  - Which intervention could reduce projected delay?

---

# Success Criteria

The project will be considered successful if it demonstrates:

1. Reliable preprocessing of historical project data.
2. Meaningful prediction of cost and schedule risk.
3. Proper comparison between statistical and ML methods.
4. Measurable assessment of CUF field predictive value.
5. Explainable project-level predictions.
6. Early warning signals with useful lead time.
7. Actionable project prioritization.
8. A usable monitoring dashboard.
9. Clear and reproducible documentation.
10. Open-source implementation.

---

# Project Vision

> **From reporting what went wrong to predicting what may go wrong and helping decision-makers act before it becomes critical.**

Project Sentinel AI aims to make infrastructure monitoring proactive by combining historical project intelligence, machine learning, explainable AI and decision-support workflows into one integrated platform.

---

## Team Development Strategy

For a hackathon prototype, build the core intelligence first:

```text
Priority 1 → Data + EDA
Priority 2 → Feature Engineering
Priority 3 → Cost/Delay Models
Priority 4 → Statistical vs ML Comparison
Priority 5 → Risk Scoring
Priority 6 → Explainability
Priority 7 → Early Warning System
Priority 8 → Dashboard
Priority 9 → LLM Assistant
```

**Do not reverse this order.**

A polished chatbot with weak predictions is not a strong solution. The ML pipeline, evaluation and early-warning logic are the foundation. The dashboard and LLM should make that intelligence usable.
