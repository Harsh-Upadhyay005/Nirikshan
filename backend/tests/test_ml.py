"""
Tests for ML prediction functionality.
"""
import pytest


class TestMLPrediction:
    """Test ML prediction functions."""
    
    def test_predict_risk_with_valid_input(self):
        """Test ML prediction with valid project data."""
        from src.ml_service import predict_risk
        
        project_data = {
            "ministry": "Ministry of Road Transport & Highways",
            "category": "National Highways",
            "agency": "National Highways Authority of India [NHAI]",
            "state": "Maharashtra",
            "is_multi_state": 0,
            "original_cost_cr": 850.0,
            "approval_date": "2024-03-01",
            "start_date": "2024-06-01",
            "target_doc": "2027-06-01",
            "physical_progress_pct": 22.0,
            "cumulative_expenditure_cr": 140.0,
            "has_legacy_code": 0,
            "has_pmgid": 1,
        }
        
        result = predict_risk(project_data)
        
        assert "delay_probability" in result
        assert "cost_overrun_probability" in result
        assert "expected_slippage_months" in result
        assert "expected_overrun_value_cr" in result
        assert "risk_segment" in result
        assert "needs_attention" in result
        
        assert 0 <= result["delay_probability"] <= 1
        assert 0 <= result["cost_overrun_probability"] <= 1
        assert result["risk_segment"] in ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]
        assert isinstance(result["needs_attention"], bool)
    
    def test_predict_handles_unseen_ministry(self):
        """Test prediction with unknown ministry (should use fallback)."""
        from src.ml_service import predict_risk
        
        project_data = {
            "ministry": "Ministry of Unknown Affairs",
            "category": "National Highways",
            "agency": "National Highways Authority of India [NHAI]",
            "state": "Maharashtra",
            "is_multi_state": 0,
            "original_cost_cr": 500.0,
            "approval_date": "2024-01-01",
            "start_date": "2024-03-01",
            "target_doc": "2026-12-01",
            "physical_progress_pct": 15.0,
            "cumulative_expenditure_cr": 50.0,
            "has_legacy_code": 0,
            "has_pmgid": 1,
        }
        
        result = predict_risk(project_data)
        
        assert result is not None
        assert "delay_probability" in result
    
    def test_predict_with_missing_approval_date(self):
        """Test prediction handles missing approval date."""
        from src.ml_service import predict_risk
        
        project_data = {
            "ministry": "Ministry of Road Transport & Highways",
            "category": "National Highways",
            "agency": "National Highways Authority of India [NHAI]",
            "state": "Maharashtra",
            "is_multi_state": 0,
            "original_cost_cr": 500.0,
            "approval_date": None,
            "start_date": "2024-03-01",
            "target_doc": "2026-12-01",
            "physical_progress_pct": 15.0,
            "cumulative_expenditure_cr": 50.0,
            "has_legacy_code": 0,
            "has_pmgid": 1,
        }
        
        result = predict_risk(project_data)
        
        assert result is not None
        assert "delay_probability" in result
    
    def test_predict_high_risk_project(self):
        """Test prediction for high-risk project characteristics."""
        from src.ml_service import predict_risk
        
        project_data = {
            "ministry": "Ministry of Road Transport & Highways",
            "category": "National Highways",
            "agency": "National Highways Authority of India [NHAI]",
            "state": "Uttar Pradesh",
            "is_multi_state": 1,
            "original_cost_cr": 5000.0,
            "approval_date": "2020-01-01",
            "start_date": "2020-06-01",
            "target_doc": "2023-12-01",
            "physical_progress_pct": 35.0,
            "cumulative_expenditure_cr": 3500.0,
            "has_legacy_code": 1,
            "has_pmgid": 0,
        }
        
        result = predict_risk(project_data)
        
        assert result["needs_attention"] or result["delay_probability"] > 0.5


class TestPredictionEndpoint:
    """Test prediction API endpoint."""
    
    def test_prediction_endpoint_success(self, client, admin_token):
        """Test prediction endpoint with admin role."""
        response = client.post(
            "/api/v1/predict",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "ministry": "Ministry of Road Transport & Highways",
                "category": "National Highways",
                "agency": "National Highways Authority of India [NHAI]",
                "state": "Maharashtra",
                "is_multi_state": 0,
                "original_cost_cr": 850.0,
                "approval_date": "2024-03-01",
                "start_date": "2024-06-01",
                "target_doc": "2027-06-01",
                "physical_progress_pct": 22.0,
                "cumulative_expenditure_cr": 140.0,
                "has_legacy_code": 0,
                "has_pmgid": 1,
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "delay_probability" in data
        assert "risk_segment" in data
    
    def test_prediction_requires_auth(self, client):
        """Test prediction endpoint requires authentication."""
        response = client.post(
            "/api/v1/predict",
            json={
                "ministry": "Test Ministry",
                "category": "Test Category",
                "agency": "Test Agency",
                "state": "Test State",
                "original_cost_cr": 100.0,
                "start_date": "2024-01-01",
                "target_doc": "2025-01-01",
                "physical_progress_pct": 10.0,
                "cumulative_expenditure_cr": 10.0,
            }
        )
        
        assert response.status_code == 403
    
    def test_auditor_cannot_predict(self, client, db):
        """Test auditor role cannot access prediction endpoint."""
        from src.auth import get_password_hash
        from src import models
        
        auditor = models.User(
            email="auditor@gov.in",
            password_hash=get_password_hash("auditorpass123"),
            role="auditor",
        )
        db.add(auditor)
        db.commit()
        
        login_response = client.post(
            "/auth/login",
            json={"email": "auditor@gov.in", "password": "auditorpass123"}
        )
        auditor_token = login_response.json()["token"]
        
        response = client.post(
            "/api/v1/predict",
            headers={"Authorization": f"Bearer {auditor_token}"},
            json={
                "ministry": "Ministry of Road Transport & Highways",
                "category": "National Highways",
                "agency": "Test Agency",
                "state": "Maharashtra",
                "original_cost_cr": 850.0,
                "start_date": "2024-06-01",
                "target_doc": "2027-06-01",
                "physical_progress_pct": 22.0,
                "cumulative_expenditure_cr": 140.0,
            }
        )
        
        assert response.status_code == 403


class TestFeatureEngineering:
    """Test feature engineering in ML pipeline."""
    
    def test_prepare_features(self):
        """Test feature preparation function."""
        from ml.predict import prepare_features
        
        raw = {
            "ministry": "Ministry of Road Transport & Highways",
            "category": "National Highways",
            "agency": "National Highways Authority of India [NHAI]",
            "state": "Maharashtra",
            "is_multi_state": 0,
            "original_cost_cr": 850.0,
            "approval_date": "2024-03-01",
            "start_date": "2024-06-01",
            "target_doc": "2027-06-01",
            "physical_progress_pct": 22.0,
            "cumulative_expenditure_cr": 140.0,
            "has_legacy_code": 0,
            "has_pmgid": 1,
        }
        
        features_df = prepare_features(raw)
        
        assert features_df is not None
        assert len(features_df) == 1
        assert "log_original_cost" in features_df.columns
        assert "Physical Progress (%)" in features_df.columns
        assert "project_age_months" in features_df.columns
