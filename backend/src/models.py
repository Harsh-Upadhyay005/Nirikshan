from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, Numeric, 
    ForeignKey, DateTime, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Ministry(Base):
    __tablename__ = "ministries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)
    
    projects = relationship("Project", back_populates="ministry")


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)
    
    projects = relationship("Project", back_populates="category")


class Agency(Base):
    __tablename__ = "agencies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)
    
    projects = relationship("Project", back_populates="agency")


class State(Base):
    __tablename__ = "states"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)
    
    project_states = relationship("ProjectState", back_populates="state")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(Integer, unique=True, nullable=False, index=True)
    project_name = Column(Text, nullable=False)
    
    ministry_id = Column(Integer, ForeignKey("ministries.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    agency_id = Column(Integer, ForeignKey("agencies.id"))
    
    legacy_ocms_code = Column(Text)
    pmgid = Column(Text)
    is_multi_state = Column(Boolean, default=False)
    
    approval_date = Column(Date)
    start_date = Column(Date, nullable=False)
    target_doc = Column(Date)
    
    original_cost_cr = Column(Numeric(12, 2), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    ministry = relationship("Ministry", back_populates="projects")
    category = relationship("Category", back_populates="projects")
    agency = relationship("Agency", back_populates="projects")
    project_states = relationship("ProjectState", back_populates="project", cascade="all, delete-orphan")
    snapshots = relationship("ProjectSnapshot", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan")


class ProjectState(Base):
    __tablename__ = "project_states"
    
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    state_id = Column(Integer, ForeignKey("states.id"), primary_key=True)
    
    project = relationship("Project", back_populates="project_states")
    state = relationship("State", back_populates="project_states")


class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    report_month = Column(Date, nullable=False)
    
    revised_doc = Column(Date)
    revised_cost_cr = Column(Numeric(12, 2))
    cumulative_expenditure_cr = Column(Numeric(12, 2))
    physical_progress_pct = Column(Numeric(5, 2))
    
    is_delayed = Column(Boolean)
    is_cost_overrun = Column(Boolean)
    schedule_slippage_months = Column(Integer)
    cost_overrun_pct = Column(Numeric(8, 2))
    
    project = relationship("Project", back_populates="snapshots")
    predictions = relationship("RiskPrediction", back_populates="snapshot", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint("project_id", "report_month", name="uq_project_report_month"),
        Index("idx_snapshots_project", "project_id"),
        Index("idx_snapshots_month", "report_month"),
    )


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    snapshot_id = Column(Integer, ForeignKey("project_snapshots.id", ondelete="CASCADE"))
    
    model_version = Column(Text, nullable=False)
    
    delay_probability = Column(Numeric(5, 4))
    cost_overrun_probability = Column(Numeric(5, 4))
    expected_slippage_months = Column(Numeric(6, 2))
    expected_overrun_value_cr = Column(Numeric(12, 2))
    
    risk_segment = Column(Text)
    risk_score = Column(Numeric(8, 4))
    
    needs_alert = Column(Boolean, default=False, index=True)
    
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="predictions")
    snapshot = relationship("ProjectSnapshot", back_populates="predictions")
    
    __table_args__ = (
        Index("idx_predictions_project", "project_id"),
        Index("idx_predictions_alert", "needs_alert"),
    )


# User Management Models (merged from Node backend)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False, index=True)
    password_hash = Column(Text)  # Nullable for OAuth users
    role = Column(Text, nullable=False)  # admin, ministry_officer, auditor
    ministry_name = Column(Text)
    
    # OAuth fields
    oauth_provider = Column(Text)  # 'google', None for regular users
    oauth_id = Column(Text)  # Google user ID
    full_name = Column(Text)
    profile_picture = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    project_notes = relationship("ProjectNote", back_populates="user", cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ministry_filter = Column(Text)
    state_filter = Column(Text)
    min_risk_score = Column(Numeric(8, 4))
    
    user = relationship("User", back_populates="subscriptions")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_code = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="notifications")
    
    __table_args__ = (
        Index("idx_notifications_user", "user_id"),
        Index("idx_notifications_read", "read_at"),
    )


class ProjectNote(Base):
    __tablename__ = "project_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_code = Column(Integer, nullable=False)
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="project_notes")
    
    __table_args__ = (
        Index("idx_project_notes_code", "project_code"),
    )
