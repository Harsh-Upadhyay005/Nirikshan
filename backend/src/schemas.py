from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from decimal import Decimal


class MinistryBase(BaseModel):
    name: str


class MinistryCreate(MinistryBase):
    pass


class Ministry(MinistryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class AgencyBase(BaseModel):
    name: str


class AgencyCreate(AgencyBase):
    pass


class Agency(AgencyBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class StateBase(BaseModel):
    name: str


class StateCreate(StateBase):
    pass


class State(StateBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    project_code: int
    project_name: str
    legacy_ocms_code: str | None = None
    pmgid: str | None = None
    is_multi_state: bool = False
    approval_date: date | None = None
    start_date: date
    target_doc: date | None = None
    original_cost_cr: Decimal


class ProjectCreate(ProjectBase):
    ministry_id: int
    category_id: int
    agency_id: int
    state_ids: list[int] = []


class ProjectUpdate(BaseModel):
    project_name: str | None = None
    approval_date: date | None = None
    target_doc: date | None = None
    original_cost_cr: Decimal | None = None


class Project(ProjectBase):
    id: int
    ministry_id: int
    category_id: int
    agency_id: int
    created_at: datetime
    
    ministry: Ministry | None = None
    category: Category | None = None
    agency: Agency | None = None
    
    model_config = ConfigDict(from_attributes=True)


class ProjectSnapshot(BaseModel):
    id: int
    project_id: int
    report_month: date
    revised_doc: date | None = None
    revised_cost_cr: Decimal | None = None
    cumulative_expenditure_cr: Decimal | None = None
    physical_progress_pct: Decimal | None = None
    is_delayed: bool | None = None
    is_cost_overrun: bool | None = None
    schedule_slippage_months: int | None = None
    cost_overrun_pct: Decimal | None = None
    
    model_config = ConfigDict(from_attributes=True)


class RiskPredictionInput(BaseModel):
    ministry: str
    category: str
    agency: str
    state: str
    is_multi_state: int = 0
    original_cost_cr: float = Field(gt=0, description="Original project cost in crores")
    approval_date: str | None = Field(None, description="YYYY-MM-DD format")
    start_date: str = Field(description="YYYY-MM-DD format")
    target_doc: str = Field(description="Target completion date YYYY-MM-DD")
    physical_progress_pct: float = Field(ge=0, le=100)
    cumulative_expenditure_cr: float = Field(ge=0)
    has_legacy_code: int = Field(0, ge=0, le=1)
    has_pmgid: int = Field(0, ge=0, le=1)


class RiskPredictionOutput(BaseModel):
    delay_probability: float
    expected_slippage_months: float
    cost_overrun_probability: float
    expected_overrun_value_cr: float
    risk_segment: str
    needs_attention: bool


class RiskPrediction(BaseModel):
    id: int
    project_id: int
    snapshot_id: int | None = None
    model_version: str
    delay_probability: Decimal | None = None
    cost_overrun_probability: Decimal | None = None
    expected_slippage_months: Decimal | None = None
    expected_overrun_value_cr: Decimal | None = None
    risk_segment: str | None = None
    risk_score: Decimal | None = None
    needs_alert: bool = False
    predicted_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProjectWithLatestPrediction(BaseModel):
    project: Project
    latest_snapshot: ProjectSnapshot | None = None
    latest_prediction: RiskPrediction | None = None


class AlertSummary(BaseModel):
    total_alerts: int
    critical_risk_count: int
    high_risk_count: int
    total_expected_overrun_cr: float
    average_delay_probability: float
    average_cost_overrun_probability: float


class HealthCheck(BaseModel):
    status: str
    database: str
    ml_models: str


# Authentication Schemas

class UserCreate(BaseModel):
    email: str
    password: str
    role: str  # admin, ministry_officer, auditor
    ministry_name: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None
    user_id: int | None = None
    role: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    ministry_name: str | None = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserWithToken(BaseModel):
    user: UserResponse
    token: str


# Subscription Schemas

class SubscriptionCreate(BaseModel):
    ministry_filter: str | None = None
    state_filter: str | None = None
    min_risk_score: float | None = None


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    ministry_filter: str | None = None
    state_filter: str | None = None
    min_risk_score: Decimal | None = None
    
    model_config = ConfigDict(from_attributes=True)


# Notification Schemas

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    project_code: int
    message: str
    sent_at: datetime
    read_at: datetime | None = None
    
    model_config = ConfigDict(from_attributes=True)


# Project Note Schemas

class ProjectNoteCreate(BaseModel):
    note_text: str


class ProjectNoteResponse(BaseModel):
    id: int
    user_id: int
    project_code: int
    note_text: str
    created_at: datetime
    user: UserResponse | None = None
    
    model_config = ConfigDict(from_attributes=True)


# Dashboard Schema

class DashboardSummary(BaseModel):
    alert_summary: AlertSummary
    unread_notifications: int
    top_alerts: list
    recent_projects: list
    user_info: dict
