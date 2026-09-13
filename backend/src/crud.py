from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from . import models, schemas


def get_ministry_by_name(db: Session, name: str) -> models.Ministry | None:
    return db.query(models.Ministry).filter(models.Ministry.name == name).first()


def get_or_create_ministry(db: Session, name: str) -> models.Ministry:
    ministry = get_ministry_by_name(db, name)
    if not ministry:
        ministry = models.Ministry(name=name)
        db.add(ministry)
        db.commit()
        db.refresh(ministry)
    return ministry


def get_category_by_name(db: Session, name: str) -> models.Category | None:
    return db.query(models.Category).filter(models.Category.name == name).first()


def get_or_create_category(db: Session, name: str) -> models.Category:
    category = get_category_by_name(db, name)
    if not category:
        category = models.Category(name=name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category


def get_agency_by_name(db: Session, name: str) -> models.Agency | None:
    return db.query(models.Agency).filter(models.Agency.name == name).first()


def get_or_create_agency(db: Session, name: str) -> models.Agency:
    agency = get_agency_by_name(db, name)
    if not agency:
        agency = models.Agency(name=name)
        db.add(agency)
        db.commit()
        db.refresh(agency)
    return agency


def get_state_by_name(db: Session, name: str) -> models.State | None:
    return db.query(models.State).filter(models.State.name == name).first()


def get_or_create_state(db: Session, name: str) -> models.State:
    state = get_state_by_name(db, name)
    if not state:
        state = models.State(name=name)
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


def get_project(db: Session, project_id: int) -> models.Project | None:
    return db.query(models.Project).options(
        joinedload(models.Project.ministry),
        joinedload(models.Project.category),
        joinedload(models.Project.agency),
    ).filter(models.Project.id == project_id).first()


def get_project_by_code(db: Session, project_code: int) -> models.Project | None:
    return db.query(models.Project).options(
        joinedload(models.Project.ministry),
        joinedload(models.Project.category),
        joinedload(models.Project.agency),
    ).filter(models.Project.project_code == project_code).first()


def get_projects(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    ministry_id: int | None = None,
    category_id: int | None = None,
) -> list[models.Project]:
    query = db.query(models.Project).options(
        joinedload(models.Project.ministry),
        joinedload(models.Project.category),
        joinedload(models.Project.agency),
    )
    
    if ministry_id:
        query = query.filter(models.Project.ministry_id == ministry_id)
    if category_id:
        query = query.filter(models.Project.category_id == category_id)
    
    return query.offset(skip).limit(limit).all()


def create_project(db: Session, project: schemas.ProjectCreate) -> models.Project:
    db_project = models.Project(
        project_code=project.project_code,
        project_name=project.project_name,
        ministry_id=project.ministry_id,
        category_id=project.category_id,
        agency_id=project.agency_id,
        legacy_ocms_code=project.legacy_ocms_code,
        pmgid=project.pmgid,
        is_multi_state=project.is_multi_state,
        approval_date=project.approval_date,
        start_date=project.start_date,
        target_doc=project.target_doc,
        original_cost_cr=project.original_cost_cr,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    for state_id in project.state_ids:
        project_state = models.ProjectState(project_id=db_project.id, state_id=state_id)
        db.add(project_state)
    
    db.commit()
    db.refresh(db_project)
    return db_project


def get_latest_snapshot(db: Session, project_id: int) -> models.ProjectSnapshot | None:
    return db.query(models.ProjectSnapshot).filter(
        models.ProjectSnapshot.project_id == project_id
    ).order_by(desc(models.ProjectSnapshot.report_month)).first()


def get_latest_prediction(db: Session, project_id: int) -> models.RiskPrediction | None:
    return db.query(models.RiskPrediction).filter(
        models.RiskPrediction.project_id == project_id
    ).order_by(desc(models.RiskPrediction.predicted_at)).first()


def create_prediction(
    db: Session,
    project_id: int,
    prediction_data: dict,
    model_version: str = "v1.0",
    snapshot_id: int | None = None,
) -> models.RiskPrediction:
    risk_score = (
        float(prediction_data.get("delay_probability", 0)) * 0.5 +
        float(prediction_data.get("cost_overrun_probability", 0)) * 0.5
    )
    
    db_prediction = models.RiskPrediction(
        project_id=project_id,
        snapshot_id=snapshot_id,
        model_version=model_version,
        delay_probability=prediction_data.get("delay_probability"),
        cost_overrun_probability=prediction_data.get("cost_overrun_probability"),
        expected_slippage_months=prediction_data.get("expected_slippage_months"),
        expected_overrun_value_cr=prediction_data.get("expected_overrun_value_cr"),
        risk_segment=prediction_data.get("risk_segment"),
        risk_score=risk_score,
        needs_alert=prediction_data.get("needs_attention", False),
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


def get_alerts(db: Session, skip: int = 0, limit: int = 100) -> list[models.RiskPrediction]:
    return db.query(models.RiskPrediction).options(
        joinedload(models.RiskPrediction.project).joinedload(models.Project.ministry),
        joinedload(models.RiskPrediction.project).joinedload(models.Project.category),
    ).filter(
        models.RiskPrediction.needs_alert == True
    ).order_by(
        desc(models.RiskPrediction.risk_score)
    ).offset(skip).limit(limit).all()


def get_alert_summary(db: Session) -> dict:
    alerts = db.query(models.RiskPrediction).filter(
        models.RiskPrediction.needs_alert == True
    ).all()
    
    if not alerts:
        return {
            "total_alerts": 0,
            "critical_risk_count": 0,
            "high_risk_count": 0,
            "total_expected_overrun_cr": 0.0,
            "average_delay_probability": 0.0,
            "average_cost_overrun_probability": 0.0,
        }
    
    critical_count = sum(1 for a in alerts if a.risk_segment == "Critical Risk")
    high_count = sum(1 for a in alerts if a.risk_segment == "High Risk")
    
    total_overrun = sum(float(a.expected_overrun_value_cr or 0) for a in alerts)
    avg_delay = sum(float(a.delay_probability or 0) for a in alerts) / len(alerts)
    avg_overrun = sum(float(a.cost_overrun_probability or 0) for a in alerts) / len(alerts)
    
    return {
        "total_alerts": len(alerts),
        "critical_risk_count": critical_count,
        "high_risk_count": high_count,
        "total_expected_overrun_cr": round(total_overrun, 2),
        "average_delay_probability": round(avg_delay, 3),
        "average_cost_overrun_probability": round(avg_overrun, 3),
    }


def get_ministries(db: Session) -> list[models.Ministry]:
    return db.query(models.Ministry).order_by(models.Ministry.name).all()


def get_categories(db: Session) -> list[models.Category]:
    return db.query(models.Category).order_by(models.Category.name).all()


def get_agencies(db: Session) -> list[models.Agency]:
    return db.query(models.Agency).order_by(models.Agency.name).all()


def get_states(db: Session) -> list[models.State]:
    return db.query(models.State).order_by(models.State.name).all()
