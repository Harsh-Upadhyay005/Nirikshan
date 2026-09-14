"""
Pytest configuration and fixtures for testing.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret-key-for-testing-only-min-32-chars"
os.environ["CORS_ORIGINS"] = '["http://localhost:3000"]'
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["ENV"] = "testing"

from src.main import app
from src.database import Base, get_db
from src import models

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db):
    """Create a test user in the database."""
    from src.auth import get_password_hash
    
    user = models.User(
        email="test@gov.in",
        password_hash=get_password_hash("testpassword123"),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def ministry_officer(db):
    """Create a ministry officer user."""
    from src.auth import get_password_hash
    
    user = models.User(
        email="officer@transport.gov.in",
        password_hash=get_password_hash("officerpass123"),
        role="ministry_officer",
        ministry_name="Ministry of Road Transport & Highways",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auditor(db):
    """Create an auditor user."""
    from src.auth import get_password_hash
    
    user = models.User(
        email="auditor@gov.in",
        password_hash=get_password_hash("auditorpass123"),
        role="auditor",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(client, test_user):
    """Get authentication token for admin user."""
    response = client.post(
        "/auth/login",
        json={"email": "test@gov.in", "password": "testpassword123"}
    )
    return response.json()["token"]


@pytest.fixture
def officer_token(client, ministry_officer):
    """Get authentication token for ministry officer."""
    response = client.post(
        "/auth/login",
        json={"email": "officer@transport.gov.in", "password": "officerpass123"}
    )
    return response.json()["token"]


@pytest.fixture
def test_ministry(db):
    """Create a test ministry."""
    ministry = models.Ministry(name="Ministry of Road Transport & Highways")
    db.add(ministry)
    db.commit()
    db.refresh(ministry)
    return ministry


@pytest.fixture
def test_category(db):
    """Create a test category."""
    category = models.Category(name="National Highways")
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@pytest.fixture
def test_agency(db):
    """Create a test agency."""
    agency = models.Agency(name="National Highways Authority of India [NHAI]")
    db.add(agency)
    db.commit()
    db.refresh(agency)
    return agency


@pytest.fixture
def test_project(db, test_ministry, test_category, test_agency):
    """Create a test project."""
    from datetime import date
    
    project = models.Project(
        project_code=12345,
        project_name="Test Highway Project",
        ministry_id=test_ministry.id,
        category_id=test_category.id,
        agency_id=test_agency.id,
        is_multi_state=False,
        approval_date=date(2024, 1, 1),
        start_date=date(2024, 6, 1),
        target_doc=date(2027, 6, 1),
        original_cost_cr=850.0,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
