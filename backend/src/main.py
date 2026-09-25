from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from pathlib import Path
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import sys
import logging
from logging.handlers import RotatingFileHandler
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas, crud, auth
from .database import engine, get_db
from .config import settings
from .ml_service import predict_risk
from .scheduler import start_scheduler
from .oauth import google_oauth
from .email_service import email_service

# Configure logging
if settings.env == "production":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler('backend.log', maxBytes=10485760, backupCount=5),
            logging.StreamHandler()
        ]
    )
else:
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )

logger = logging.getLogger(__name__)



# Lifespan context manager (replaces deprecated on_event)
@asynccontextmanager
async def lifespan(application: FastAPI):
    # --- Startup ---
    logger.info("Starting Nirikshan backend...")

    # Validate configuration
    try:
        settings.validate_production_config()
        logger.info("Configuration validation passed")
    except ValueError as e:
        logger.error(f"Configuration validation failed: {e}")
        raise

    # Test database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Cannot connect to database: {e}")
        raise RuntimeError(f"Database connection failed: {e}")

    # Test ML models
    try:
        from .ml_service import predict_risk as _pr
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load ML models: {e}")
        raise RuntimeError(f"ML models unavailable: {e}")

    # Start scheduler
    start_scheduler()
    logger.info("Background scheduler started")

    yield  # application is running

    # --- Shutdown ---
    logger.info("Shutting down gracefully...")


models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nirikshan API",
    description="Unified Python backend for Nirikshan infrastructure risk monitoring platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path} - Client: {request.client.host if request.client else 'unknown'}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}", exc_info=True)
        raise




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
        db.execute(text("SELECT 1"))
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
@limiter.limit("3/minute")
def signup(request: Request, user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate ministry_officer has ministry_name
    if user_create.role == "ministry_officer" and not user_create.ministry_name:
        raise HTTPException(status_code=400, detail="Ministry name required for ministry_officer role")
    
    # Password required for non-OAuth signup
    if not user_create.password:
        raise HTTPException(status_code=400, detail="Password is required")
    
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
    
    # Send welcome email
    try:
        email_service.send_welcome_email(
            to_email=db_user.email,
            to_name=db_user.email.split("@")[0],
            role=db_user.role
        )
    except Exception as e:
        logger.warning(f"Failed to send welcome email: {e}")
    
    # Create token
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role}
    )
    
    return {
        "user": db_user,
        "token": access_token,
    }


@app.post("/auth/login", response_model=schemas.UserWithToken, tags=["Authentication"])
@limiter.limit("5/minute")
def login(request: Request, user_login: schemas.UserLogin, db: Session = Depends(get_db)):
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


@app.get("/auth/google/url", tags=["Authentication"])
def get_google_auth_url():
    """Get Google OAuth authorization URL."""
    if not google_oauth.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured"
        )
    
    return {
        "authorization_url": google_oauth.get_authorization_url()
    }


@app.post("/auth/google/callback", response_model=schemas.UserWithToken, tags=["Authentication"])
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback.
    Creates user if doesn't exist, or logs in existing user.
    """
    if not google_oauth.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured"
        )
    
    # Exchange code for token
    token_response = await google_oauth.exchange_code_for_token(code)
    access_token = token_response.get("access_token")
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get access token from Google"
        )
    
    # Get user info from Google
    user_info = await google_oauth.get_user_info(access_token)
    google_email = user_info.get("email")
    google_id = user_info.get("id")
    google_name = user_info.get("name")
    google_picture = user_info.get("picture")
    
    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get email from Google"
        )
    
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == google_email).first()
    
    if existing_user:
        # Update OAuth info if it's a new OAuth login for existing user
        if not existing_user.oauth_provider:
            existing_user.oauth_provider = "google"
            existing_user.oauth_id = google_id
            existing_user.full_name = google_name
            existing_user.profile_picture = google_picture
            db.commit()
            db.refresh(existing_user)
        
        user = existing_user
    else:
        # Create new user with auditor role (can be changed by admin)
        user = models.User(
            email=google_email,
            oauth_provider="google",
            oauth_id=google_id,
            full_name=google_name,
            profile_picture=google_picture,
            role="auditor",  # Default role for OAuth users
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Send welcome email
        try:
            email_service.send_welcome_email(
                to_email=user.email,
                to_name=user.full_name or user.email.split("@")[0],
                role=user.role
            )
        except Exception as e:
            logger.warning(f"Failed to send welcome email: {e}")
    
    # Create JWT token
    jwt_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    
    return {
        "user": user,
        "token": jwt_token,
    }


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
        logger.error(f"Prediction failed for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction service unavailable",
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
    
    notification.read_at = datetime.now(timezone.utc)
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
    ).update({"read_at": datetime.now(timezone.utc)})
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
