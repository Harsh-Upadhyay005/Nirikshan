"""
Tests for API endpoints.
"""
import pytest


class TestHealthCheck:
    """Test health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check returns correct status."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data


class TestProjectEndpoints:
    """Test project CRUD endpoints."""
    
    def test_list_projects(self, client, admin_token, test_project):
        """Test listing projects."""
        response = client.get(
            "/api/v1/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["project_code"] == 12345
    
    def test_get_project_by_id(self, client, admin_token, test_project):
        """Test getting single project."""
        response = client.get(
            f"/api/v1/projects/{test_project.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["project_code"] == 12345
        assert data["project_name"] == "Test Highway Project"
    
    def test_get_nonexistent_project(self, client, admin_token):
        """Test getting nonexistent project returns 404."""
        response = client.get(
            "/api/v1/projects/99999",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
    
    def test_ministry_officer_sees_only_own_ministry(self, client, officer_token, test_project, ministry_officer):
        """Test ministry officer can only see their ministry's projects."""
        response = client.get(
            f"/api/v1/projects/{test_project.id}",
            headers={"Authorization": f"Bearer {officer_token}"}
        )
        
        assert response.status_code == 200


class TestNotificationEndpoints:
    """Test notification endpoints."""
    
    def test_get_notifications(self, client, admin_token):
        """Test getting user notifications."""
        response = client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_mark_notification_read(self, client, admin_token, db, test_user):
        """Test marking notification as read."""
        from src import models
        
        notification = models.Notification(
            user_id=test_user.id,
            project_code=12345,
            message="Test notification"
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        response = client.patch(
            f"/api/v1/notifications/{notification.id}/read",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["read_at"] is not None
    
    def test_mark_all_notifications_read(self, client, admin_token):
        """Test marking all notifications as read."""
        response = client.post(
            "/api/v1/notifications/mark-all-read",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "marked_read" in data


class TestSubscriptionEndpoints:
    """Test subscription endpoints."""
    
    def test_create_subscription(self, client, admin_token):
        """Test creating alert subscription."""
        response = client.post(
            "/api/v1/subscriptions",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "ministry_filter": "Ministry of Road Transport & Highways",
                "min_risk_score": 0.7
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["ministry_filter"] == "Ministry of Road Transport & Highways"
        assert float(data["min_risk_score"]) == 0.7
    
    def test_get_subscriptions(self, client, admin_token):
        """Test getting user subscriptions."""
        response = client.get(
            "/api/v1/subscriptions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_delete_subscription(self, client, admin_token, db, test_user):
        """Test deleting subscription."""
        from src import models
        
        subscription = models.Subscription(
            user_id=test_user.id,
            ministry_filter="Test Ministry",
            min_risk_score=0.5
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        response = client.delete(
            f"/api/v1/subscriptions/{subscription.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 204


class TestProjectNotesEndpoints:
    """Test project notes endpoints."""
    
    def test_create_project_note(self, client, admin_token):
        """Test creating project note."""
        response = client.post(
            "/api/v1/projects/12345/notes",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "note_text": "This is a test note about the project."
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["note_text"] == "This is a test note about the project."
        assert data["project_code"] == 12345
    
    def test_get_project_notes(self, client, admin_token):
        """Test getting project notes."""
        response = client.get(
            "/api/v1/projects/12345/notes",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestLookupEndpoints:
    """Test lookup data endpoints."""
    
    def test_list_ministries(self, client, test_ministry):
        """Test listing ministries."""
        response = client.get("/api/v1/ministries")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_list_categories(self, client, test_category):
        """Test listing categories."""
        response = client.get("/api/v1/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_list_agencies(self, client, test_agency):
        """Test listing agencies."""
        response = client.get("/api/v1/agencies")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestDashboardEndpoint:
    """Test dashboard summary endpoint."""
    
    def test_dashboard_summary(self, client, admin_token):
        """Test getting dashboard summary."""
        response = client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "alert_summary" in data
        assert "unread_notifications" in data
        assert "user_info" in data
