from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime
import sys

from . import models, schemas, crud, auth
from .database import engine, get_db
from .config import settings
from .ml_service import predict_risk
from .scheduler import start_scheduler

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nirikshan API",
    description="Unified Python backend for Nirikshan infrastructure risk monitoring platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event to start background scheduler
@app.on_event("startup")
async def startup_event():
    start_scheduler()


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Nirikshan API - Unified Python Backend",
        "version": "1.0.0",
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


# ======================
# Authentication Routes
# ======================

@app.post("/auth/signup", response_model=schemas.UserWithToken, tags=["Authentication"])
def signup(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate ministry_officer has ministry_name
    if user_create.role == "ministry_officer" and not user_create.ministry_name:
        raise HTTPException(status_code=400, detail="Ministry name required for ministry_officer role")
    
    # Create user
    hashed_password = auth.get_password_hash(user_create.password)
    db_user = models.User(
        email=user_create.email,
        password_hash=hashed_password,
        role=user_create.role,
        ministry_name=user_create.ministry_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create token
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role}
    )
    
    return {
        "user": db_user,
        "token": access_token,
    }


@app.post("/auth/login", response_model=schemas.UserWithToken, tags=["Authentication"])
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    
    return {
        "user": user,
        "token": access_token,
    }


@app.get("/auth/me", response_model=schemas.UserResponse, tags=["Authentication"])
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ======================
# Prediction Routes
# ======================

@app.post("/api/v1/predict", response_model=schemas.RiskPredictionOutput, tags=["Predictions"])
def predict_project_risk(
    prediction_input: schemas.RiskPredictionInput,
    current_user: models.User = Depends(auth.require_role("admin", "ministry_officer")),
):
    # Ministry officers can only predict for their ministry
    if current_user.role == "ministry_officer" and current_user.ministry_name:
        if prediction_input.ministry != current_user.ministry_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only predict for projects in your ministry",
            )
    
    try:
        project_data = prediction_input.model_dump()
        result = predict_risk(project_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )


# ======================
# Project Routes
# ======================

@app.get("/api/v1/projects", response_model=list[schemas.Project], tags=["Projects"])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    ministry_id: int | None = None,
    category_id: int | None = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # Ministry officers only see their ministry
    if current_user.role == "ministry_officer" and current_user.ministry_name:
        ministry = db.query(models.Ministry).filter(models.Ministry.name == current_user.ministry_name).first()
        if ministry:
            ministry_id = ministry.id
    
    projects = crud.get_projects(db, skip=skip, limit=limit, ministry_id=ministry_id, category_id=category_id)
    return projects


@app.get("/api/v1/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def get_project(
    project_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check ministry access
    if current_user.role == "ministry_officer" and current_user.ministry_name:
        if project.ministry and project.ministry.name != current_user.ministry_name:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return project


@app.post("/api/v1/projects", response_model=schemas.Project, tags=["Projects"], status_code=status.HTTP_201_CREATED)
def create_project(
    project: schemas.ProjectCreate,
    current_user: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(get_db)
):
    existing = crud.get_project_by_code(db, project.project_code)
    if existing:
        raise HTTPException(status_code=400, detail="Project code already exists")
    return crud.create_project(db, project)


# ======================
# Alert Routes
# ======================

@app.get("/api/v1/alerts", tags=["Alerts"])
def list_alerts(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    alerts = crud.get_alerts(db, skip=skip, limit=limit)
    
    # Filter by ministry for ministry officers
    if current_user.role == "ministry_officer" and current_user.ministry_name:
        alerts = [a for a in alerts if a.project and a.project.ministry and a.project.ministry.name == current_user.ministry_name]
    
    # Filter by subscriptions
    subscriptions = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()
    if subscriptions:
        filtered_alerts = []
        for alert in alerts:
            for sub in subscriptions:
                if sub.ministry_filter and alert.project and alert.project.ministry:
                    if alert.project.ministry.name != sub.ministry_filter:
                        continue
                if sub.min_risk_score and float(alert.risk_score) < float(sub.min_risk_score):
                    continue
                filtered_alerts.append(alert)
                break
        alerts = filtered_alerts
    
    return alerts


@app.get("/api/v1/alerts/summary", response_model=schemas.AlertSummary, tags=["Alerts"])
def get_alert_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_alert_summary(db)


# ======================
# Notification Routes
# ======================

@app.get("/api/v1/notifications", response_model=list[schemas.NotificationResponse], tags=["Notifications"])
def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Notification).filter(models.Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(models.Notification.read_at == None)
    
    notifications = query.order_by(models.Notification.sent_at.desc()).limit(limit).all()
    return notifications


@app.patch("/api/v1/notifications/{notification_id}/read", response_model=schemas.NotificationResponse, tags=["Notifications"])
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notification)
    return notification


@app.post("/api/v1/notifications/mark-all-read", tags=["Notifications"])
def mark_all_notifications_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read_at == None
    ).update({"read_at": datetime.utcnow()})
    db.commit()
    return {"marked_read": count}


# ======================
# Subscription Routes
# ======================

@app.get("/api/v1/subscriptions", response_model=list[schemas.SubscriptionResponse], tags=["Subscriptions"])
def get_subscriptions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    subscriptions = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()
    return subscriptions


@app.post("/api/v1/subscriptions", response_model=schemas.SubscriptionResponse, tags=["Subscriptions"], status_code=status.HTTP_201_CREATED)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_subscription = models.Subscription(
        user_id=current_user.id,
        ministry_filter=subscription.ministry_filter,
        state_filter=subscription.state_filter,
        min_risk_score=subscription.min_risk_score,
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription


@app.delete("/api/v1/subscriptions/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Subscriptions"])
def delete_subscription(
    subscription_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(subscription)
    db.commit()
    return


# ======================
# Project Notes Routes
# ======================

@app.get("/api/v1/projects/{project_code}/notes", response_model=list[schemas.ProjectNoteResponse], tags=["Project Notes"])
def get_project_notes(
    project_code: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    notes = db.query(models.ProjectNote).filter(
        models.ProjectNote.project_code == project_code
    ).order_by(models.ProjectNote.created_at.desc()).all()
    return notes


@app.post("/api/v1/projects/{project_code}/notes", response_model=schemas.ProjectNoteResponse, tags=["Project Notes"], status_code=status.HTTP_201_CREATED)
def create_project_note(
    project_code: int,
    note: schemas.ProjectNoteCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_note = models.ProjectNote(
        user_id=current_user.id,
        project_code=project_code,
        note_text=note.note_text,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


# ======================
# Dashboard Route
# ======================

@app.get("/api/v1/dashboard/summary", tags=["Dashboard"])
def get_dashboard_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    alert_summary = crud.get_alert_summary(db)
    unread_count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read_at == None
    ).count()
    
    alerts = crud.get_alerts(db, limit=10)
    projects = crud.get_projects(db, limit=5)
    
    # Filter by ministry for ministry officers
    if current_user.role == "ministry_officer" and current_user.ministry_name:
        alerts = [a for a in alerts if a.project and a.project.ministry and a.project.ministry.name == current_user.ministry_name]
        projects = [p for p in projects if p.ministry and p.ministry.name == current_user.ministry_name]
    
    return {
        "alert_summary": alert_summary,
        "unread_notifications": unread_count,
        "top_alerts": alerts[:5],
        "recent_projects": projects[:5],
        "user_info": {
            "role": current_user.role,
            "ministry_name": current_user.ministry_name,
        },
    }


# ======================
# Lookup Routes
# ======================

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
