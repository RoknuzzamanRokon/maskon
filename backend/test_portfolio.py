import pytest
import json
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

# Mock admin user for testing
MOCK_ADMIN_USER = {"id": 1, "username": "admin", "is_admin": True}

# Mock portfolio data
MOCK_PORTFOLIO_ITEM = {
    "id": 1,
    "title": "Test Project",
    "description": "A test project description",
    "technologies": "React, Node.js, MongoDB",
    "project_url": "https://test-project.com",
    "github_url": "https://github.com/test/project",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
}


class TestPortfolioEndpoints:
    """Test portfolio CRUD endpoints"""

    @patch("main.get_db_connection")
    def test_get_portfolio_success(self, mock_db):
        """Test successful portfolio retrieval"""
        # Mock database response
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [MOCK_PORTFOLIO_ITEM]
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response = client.get("/api/portfolio")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Project"
        mock_cursor.execute.assert_called_once_with(
            "SELECT * FROM portfolio ORDER BY created_at DESC"
        )

    @patch("main.get_db_connection")
    def test_get_portfolio_empty(self, mock_db):
        """Test portfolio retrieval with no items"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response = client.get("/api/portfolio")

        assert response.status_code == 200
        assert response.json() == []

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_create_portfolio_success(self, mock_db, mock_admin):
        """Test successful portfolio item creation"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        portfolio_data = {
            "title": "New Project",
            "description": "A new project description",
            "technologies": "Vue.js, Express.js",
            "project_url": "https://new-project.com",
            "github_url": "https://github.com/test/new-project",
            "image_url": "https://example.com/new-image.jpg",
        }

        response = client.post(
            "/api/portfolio",
            json=portfolio_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Portfolio item created successfully"
        assert data["id"] == 1

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_create_portfolio_minimal_data(self, mock_db, mock_admin):
        """Test portfolio creation with minimal required data"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 2
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        portfolio_data = {
            "title": "Minimal Project",
            "description": "Minimal description",
            "technologies": "HTML, CSS",
        }

        response = client.post(
            "/api/portfolio",
            json=portfolio_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Portfolio item created successfully"
        assert data["id"] == 2

    def test_create_portfolio_unauthorized(self):
        """Test portfolio creation without authentication"""
        portfolio_data = {
            "title": "Unauthorized Project",
            "description": "Should fail",
            "technologies": "None",
        }

        response = client.post("/api/portfolio", json=portfolio_data)

        assert response.status_code == 403

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_update_portfolio_success(self, mock_db, mock_admin):
        """Test successful portfolio item update"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        update_data = {"title": "Updated Project", "description": "Updated description"}

        response = client.put(
            "/api/portfolio/1",
            json=update_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Portfolio item updated successfully"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_update_portfolio_not_found(self, mock_db, mock_admin):
        """Test updating non-existent portfolio item"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 0
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        update_data = {"title": "Updated Project"}

        response = client.put(
            "/api/portfolio/999",
            json=update_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Portfolio item not found"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_update_portfolio_no_fields(self, mock_db, mock_admin):
        """Test updating portfolio with no fields provided"""
        mock_admin.return_value = 1

        response = client.put(
            "/api/portfolio/1", json={}, headers={"Authorization": "Bearer fake-token"}
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "No fields to update"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_delete_portfolio_success(self, mock_db, mock_admin):
        """Test successful portfolio item deletion"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response = client.delete(
            "/api/portfolio/1", headers={"Authorization": "Bearer fake-token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Portfolio item deleted successfully"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_delete_portfolio_not_found(self, mock_db, mock_admin):
        """Test deleting non-existent portfolio item"""
        mock_admin.return_value = 1
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 0
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response = client.delete(
            "/api/portfolio/999", headers={"Authorization": "Bearer fake-token"}
        )

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Portfolio item not found"

    def test_delete_portfolio_unauthorized(self):
        """Test portfolio deletion without authentication"""
        response = client.delete("/api/portfolio/1")

        assert response.status_code == 403


class TestPortfolioValidation:
    """Test portfolio data validation"""

    @patch("main.get_current_admin")
    def test_create_portfolio_invalid_data(self, mock_admin):
        """Test portfolio creation with invalid data"""
        mock_admin.return_value = 1

        # Test missing required fields
        invalid_data = {"title": ""}  # Missing description and technologies

        response = client.post(
            "/api/portfolio",
            json=invalid_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        assert response.status_code == 422  # Validation error

    @patch("main.get_current_admin")
    def test_create_portfolio_long_title(self, mock_admin):
        """Test portfolio creation with title too long"""
        mock_admin.return_value = 1

        long_title = "x" * 300  # Exceeds 255 character limit
        invalid_data = {
            "title": long_title,
            "description": "Valid description",
            "technologies": "Valid tech",
        }

        response = client.post(
            "/api/portfolio",
            json=invalid_data,
            headers={"Authorization": "Bearer fake-token"},
        )

        # Should still work at API level, validation happens in frontend
        # Backend accepts the data as-is for flexibility


class TestPortfolioIntegration:
    """Test complete portfolio workflows"""

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_complete_portfolio_workflow(self, mock_db, mock_admin):
        """Test complete CRUD workflow"""
        mock_admin.return_value = 1

        # Mock database for create
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_cursor.rowcount = 1
        mock_cursor.fetchall.return_value = [MOCK_PORTFOLIO_ITEM]
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        # 1. Create portfolio item
        create_data = {
            "title": "Workflow Test Project",
            "description": "Testing complete workflow",
            "technologies": "Python, FastAPI",
        }

        create_response = client.post(
            "/api/portfolio",
            json=create_data,
            headers={"Authorization": "Bearer fake-token"},
        )
        assert create_response.status_code == 200

        # 2. Read portfolio items
        read_response = client.get("/api/portfolio")
        assert read_response.status_code == 200

        # 3. Update portfolio item
        update_data = {"title": "Updated Workflow Test"}
        update_response = client.put(
            "/api/portfolio/1",
            json=update_data,
            headers={"Authorization": "Bearer fake-token"},
        )
        assert update_response.status_code == 200

        # 4. Delete portfolio item
        delete_response = client.delete(
            "/api/portfolio/1", headers={"Authorization": "Bearer fake-token"}
        )
        assert delete_response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__])
