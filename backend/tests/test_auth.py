"""
Tests for authentication and authorization.
"""
import pytest
from src.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
)


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_password_hashing(self):
        """Test that password hashing works correctly."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
    
    def test_wrong_password(self):
        """Test that wrong password is rejected."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert not verify_password("wrongpassword", hashed)
    
    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (salt)."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)


class TestJWTTokens:
    """Test JWT token creation and validation."""
    
    def test_create_and_decode_token(self):
        """Test JWT token creation and decoding."""
        data = {"sub": "test@gov.in", "user_id": 1, "role": "admin"}
        token = create_access_token(data)
        
        assert token is not None
        decoded = decode_token(token)
        
        assert decoded.email == "test@gov.in"
        assert decoded.user_id == 1
        assert decoded.role == "admin"
    
    def test_invalid_token(self):
        """Test that invalid token raises error."""
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.here")
        
        assert exc_info.value.status_code == 401
    
    def test_token_without_subject(self):
        """Test that token without 'sub' raises error."""
        from fastapi import HTTPException
        
        data = {"user_id": 1}
        token = create_access_token(data)
        
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)
        
        assert exc_info.value.status_code == 401


class TestAuthenticationEndpoints:
    """Test authentication API endpoints."""
    
    def test_signup_success(self, client):
        """Test successful user signup."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "newuser@gov.in",
                "password": "securepassword123",
                "role": "auditor"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "newuser@gov.in"
        assert data["user"]["role"] == "auditor"
        assert "password" not in data["user"]
    
    def test_signup_duplicate_email(self, client, test_user):
        """Test signup with existing email fails."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "test@gov.in",
                "password": "password123",
                "role": "auditor"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_signup_ministry_officer_without_ministry(self, client):
        """Test that ministry officer must provide ministry name."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "officer@gov.in",
                "password": "password123",
                "role": "ministry_officer"
            }
        )
        
        assert response.status_code == 400
        assert "ministry name required" in response.json()["detail"].lower()
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@gov.in",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "test@gov.in"
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password fails."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@gov.in",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent email fails."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@gov.in",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, admin_token):
        """Test getting current user info."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@gov.in"
        assert data["role"] == "admin"
    
    def test_get_current_user_without_token(self, client):
        """Test that accessing protected route without token fails."""
        response = client.get("/auth/me")
        
        assert response.status_code == 403


class TestRoleBasedAccess:
    """Test role-based access control."""
    
    def test_admin_can_create_project(self, client, admin_token, test_ministry, test_category, test_agency):
        """Test that admin can create projects."""
        response = client.post(
            "/api/v1/projects",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "project_code": 99999,
                "project_name": "New Test Project",
                "ministry_id": test_ministry.id,
                "category_id": test_category.id,
                "agency_id": test_agency.id,
                "start_date": "2024-01-01",
                "target_doc": "2027-01-01",
                "original_cost_cr": 500.0,
                "state_ids": []
            }
        )
        
        assert response.status_code == 201
    
    def test_officer_cannot_create_project(self, client, officer_token):
        """Test that ministry officer cannot create projects."""
        response = client.post(
            "/api/v1/projects",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={
                "project_code": 99999,
                "project_name": "New Test Project",
                "ministry_id": 1,
                "category_id": 1,
                "agency_id": 1,
                "start_date": "2024-01-01",
                "target_doc": "2027-01-01",
                "original_cost_cr": 500.0,
                "state_ids": []
            }
        )
        
        assert response.status_code == 403
