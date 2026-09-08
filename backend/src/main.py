from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
import sys

from . import models, schemas, crud
from .database import engine, get_db
from .config import settings
from .ml_service import predict_risk

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nirikshan API",
    description="Backend API for Nirikshan infrastructure risk monitoring platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Nirikshan API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", response_model=schemas.HealthCheck, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    models_dir = settings.models_dir
    ml_status = "healthy" if models_dir.exists() else "unhealthy"
    
    overall_status = "healthy" if db_status == "healthy" and ml_status == "healthy" else "unhealthy"
    
    return {
        "status": overall_status,
        "database": db_status,
        "ml_models": ml_status,
    }


@app.post("/api/v1/predict", response_model=schemas.RiskPredictionOutput, tags=["Predictions"])
def predict_project_risk(
    prediction_input: schemas.RiskPredictionInput,
):
    try:
        project_data = prediction_input.model_dump()
        result = predict_risk(project_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )


@app.get("/api/v1/ministries", response_model=list[schemas.Ministry], tags=["Lookup"])
def list_ministries(db: Session = Depends(get_db)):
    return crud.get_ministries(db)


@app.get("/api/v1/categories", response_model=list[schemas.Category], tags=["Lookup"])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.get("/api/v1/agencies", response_model=list[schemas.Agency], tags=["Lookup"])
def list_agencies(db: Session = Depends(get_db)):
    return crud.get_agencies(db)


@app.get("/api/v1/states", response_model=list[schemas.State], tags=["Lookup"])
def list_states(db: Session = Depends(get_db)):
    return crud.get_states(db)


@app.get("/api/v1/projects", response_model=list[schemas.Project], tags=["Projects"])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    ministry_id: int | None = None,
    category_id: int | None = None,
    db: Session = Depends(get_db),
):
    projects = crud.get_projects(db, skip=skip, limit=limit, ministry_id=ministry_id, category_id=category_id)
    return projects


@app.get("/api/v1/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.post("/api/v1/projects", response_model=schemas.Project, tags=["Projects"], status_code=status.HTTP_201_CREATED)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    existing = crud.get_project_by_code(db, project.project_code)
    if existing:
        raise HTTPException(status_code=400, detail="Project code already exists")
    return crud.create_project(db, project)


@app.get("/api/v1/alerts", tags=["Alerts"])
def list_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    alerts = crud.get_alerts(db, skip=skip, limit=limit)
    return alerts


@app.get("/api/v1/alerts/summary", response_model=schemas.AlertSummary, tags=["Alerts"])
def get_alert_summary(db: Session = Depends(get_db)):
    return crud.get_alert_summary(db)


@app.post("/api/v1/projects/{project_id}/predict", response_model=schemas.RiskPrediction, tags=["Predictions"])
def predict_for_existing_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    latest_snapshot = crud.get_latest_snapshot(db, project_id)
    
    if not latest_snapshot or latest_snapshot.physical_progress_pct is None:
        raise HTTPException(
            status_code=400,
            detail="Project must have at least one snapshot with physical progress data",
        )
    
    project_data = {
        "ministry": project.ministry.name,
        "category": project.category.name,
        "agency": project.agency.name,
        "state": "Multi-State" if project.is_multi_state else "Unknown",
        "is_multi_state": 1 if project.is_multi_state else 0,
        "original_cost_cr": float(project.original_cost_cr),
        "approval_date": project.approval_date.isoformat() if project.approval_date else None,
        "start_date": project.start_date.isoformat(),
        "target_doc": project.target_doc.isoformat() if project.target_doc else project.start_date.isoformat(),
        "physical_progress_pct": float(latest_snapshot.physical_progress_pct),
        "cumulative_expenditure_cr": float(latest_snapshot.cumulative_expenditure_cr or 0),
        "has_legacy_code": 1 if project.legacy_ocms_code else 0,
        "has_pmgid": 1 if project.pmgid else 0,
    }
    
    try:
        prediction_result = predict_risk(project_data)
        db_prediction = crud.create_prediction(
            db,
            project_id=project_id,
            prediction_data=prediction_result,
            snapshot_id=latest_snapshot.id,
        )
        return db_prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
