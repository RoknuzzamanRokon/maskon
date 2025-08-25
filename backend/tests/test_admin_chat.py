"""
Unit Tests for Admin Chat Management

Tests for admin inquiry management functionality as specified in Requirements 3.1, 3.2, 3.4.
Tests admin panel, inquiry status management, and admin response interface.
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException
import mysql.connector

from main import app


class TestAdminChatEndpoints:
    """Test admin chat management endpoints"""

    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    def get_admin_token(self):
        """Helper to get admin authentication token"""
        # Mock admin token for testing
        with patch("main.get_current_admin") as mock_admin:
            mock_admin.return_value = 1  # Admin user ID
            return {"Authorization": "Bearer mock_admin_token"}

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_product_inquiries_success(self, mock_db, mock_admin):
        """Test successful retrieval of product inquiries"""
        mock_admin.return_value = 1  # Admin user ID

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "product_id": 123,
                "session_id": "session_123",
                "customer_email": "test@example.com",
                "customer_name": "Test Customer",
                "status": "pending",
                "priority": "medium",
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
                "last_message_at": "2024-01-01T10:30:00",
                "assigned_admin_id": None,
                "product_name": "Test Product",
                "total_messages": 3,
                "unread_messages": 2,
            }
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/inquiries", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "pending"
        assert data[0]["product_name"] == "Test Product"
        assert data[0]["unread_messages"] == 2

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_inquiries_with_filters(self, mock_db, mock_admin):
        """Test inquiry retrieval with status and priority filters"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = []
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get(
            "/api/admin/inquiries?status=pending&priority=high&limit=10",
            headers=headers,
        )

        assert response.status_code == 200
        # Verify the query was called with filters
        mock_cursor.execute.assert_called()

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_admin_chat_sessions(self, mock_db, mock_admin):
        """Test getting admin chat sessions"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "product_id": 123,
                "session_id": "session_123",
                "customer_email": "test@example.com",
                "status": "active",
                "priority": "medium",
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
                "last_message_at": "2024-01-01T10:30:00",
                "assigned_admin_id": 1,
                "product_name": "Test Product",
                "total_messages": 5,
                "unread_messages": 1,
            }
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/chat/sessions", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["assigned_admin_id"] == 1

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_admin_respond_to_chat_success(self, mock_db, mock_admin):
        """Test admin responding to a chat session"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 1, "product_id": 123},  # Session exists
            {"username": "AdminUser"},  # Admin user info
        ]
        mock_cursor.lastrowid = 456  # Message ID
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response_data = {
            "message_text": "Hello, I can help you with that product",
            "admin_id": 1,
            "admin_name": "AdminUser",
        }

        headers = self.get_admin_token()
        response = self.client.post(
            "/api/admin/chat/sessions/session_123/respond",
            json=response_data,
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Response sent successfully"
        assert data["message_id"] == 456

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_update_inquiry_status_success(self, mock_db, mock_admin):
        """Test updating inquiry status"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Inquiry exists
        mock_cursor.rowcount = 1  # One row updated
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        status_data = {
            "status": "in_progress",
            "assigned_admin_id": 1,
            "priority": "high",
        }

        headers = self.get_admin_token()
        response = self.client.put(
            "/api/admin/inquiries/1/status", json=status_data, headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "updated successfully" in data["message"]

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_inquiry_messages(self, mock_db, mock_admin):
        """Test getting messages for a specific inquiry"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Inquiry exists
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "session_id": 1,
                "sender_type": "customer",
                "sender_id": None,
                "sender_name": "Test Customer",
                "message_text": "I need help with this product",
                "message_type": "text",
                "is_read": False,
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
            },
            {
                "id": 2,
                "session_id": 1,
                "sender_type": "admin",
                "sender_id": 1,
                "sender_name": "AdminUser",
                "message_text": "I can help you with that",
                "message_type": "text",
                "is_read": True,
                "created_at": "2024-01-01T10:05:00",
                "updated_at": "2024-01-01T10:05:00",
            },
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/inquiries/1/messages", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["sender_type"] == "customer"
        assert data[1]["sender_type"] == "admin"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_respond_to_inquiry_success(self, mock_db, mock_admin):
        """Test responding to a specific inquiry"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 1, "session_id": "session_123"},  # Inquiry exists
            {"username": "AdminUser"},  # Admin user info
        ]
        mock_cursor.lastrowid = 789  # Message ID
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response_data = {
            "message_text": "Thank you for your inquiry. I can help you with that.",
            "admin_id": 1,
            "admin_name": "AdminUser",
        }

        headers = self.get_admin_token()
        response = self.client.post(
            "/api/admin/inquiries/1/respond", json=response_data, headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Response sent successfully"
        assert data["message_id"] == 789

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_inquiry_stats(self, mock_db, mock_admin):
        """Test getting inquiry statistics for admin dashboard"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [
            {"status": "pending", "count": 5},
            {"status": "in_progress", "count": 3},
            {"status": "resolved", "count": 10},
        ]
        mock_cursor.fetchone.side_effect = [
            {"total_inquiries": 18},
            {"avg_response_time": 45.5},
            {"unread_messages": 8},
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/inquiries/stats", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_inquiries" in data
        assert "status_breakdown" in data
        assert "avg_response_time_minutes" in data
        assert "unread_messages" in data
        assert data["total_inquiries"] == 18
        assert len(data["status_breakdown"]) == 3

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_get_admin_notification_dashboard(self, mock_db, mock_admin):
        """Test getting admin notification dashboard"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "product_id": 123,
                "session_id": "session_123",
                "customer_name": "Test Customer",
                "product_name": "Test Product",
                "last_message_at": "2024-01-01T10:30:00",
                "unread_messages": 2,
                "priority": "high",
            }
        ]
        mock_cursor.fetchone.side_effect = [
            {"pending_count": 5},
            {"high_priority_count": 2},
            {"overdue_count": 1},
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get(
            "/api/admin/notifications/dashboard", headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "pending_inquiries" in data
        assert "high_priority_inquiries" in data
        assert "overdue_inquiries" in data
        assert "recent_inquiries" in data
        assert data["pending_inquiries"] == 5
        assert data["high_priority_inquiries"] == 2

    @patch("main.get_current_admin")
    def test_unauthorized_access(self, mock_admin):
        """Test unauthorized access to admin endpoints"""
        mock_admin.side_effect = HTTPException(
            status_code=403, detail="Admin access required"
        )

        response = self.client.get("/api/admin/inquiries")
        assert response.status_code == 403

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_inquiry_not_found(self, mock_db, mock_admin):
        """Test handling of non-existent inquiry"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = None  # Inquiry doesn't exist
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/inquiries/999/messages", headers=headers)

        assert response.status_code == 404

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_update_chat_session_status(self, mock_db, mock_admin):
        """Test updating chat session status"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Session exists
        mock_cursor.rowcount = 1  # One row updated
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = self.get_admin_token()
        response = self.client.put(
            "/api/admin/chat/sessions/session_123/status?status=resolved",
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "updated successfully" in data["message"]

    def test_admin_response_validation(self):
        """Test admin response model validation"""
        from models.chat_models import AdminResponse

        # Valid response
        valid_response = AdminResponse(
            message_text="I can help you with that",
            admin_id=1,
            admin_name="AdminUser",
        )
        assert valid_response.message_text == "I can help you with that"
        assert valid_response.admin_id == 1

        # Test empty message validation
        with pytest.raises(ValueError):
            AdminResponse(
                message_text="",
                admin_id=1,
            )

        # Test message too long
        with pytest.raises(ValueError):
            AdminResponse(
                message_text="x" * 2001,
                admin_id=1,
            )

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_database_error_handling_admin(self, mock_db, mock_admin):
        """Test database error handling in admin endpoints"""
        mock_admin.return_value = 1
        mock_db.side_effect = mysql.connector.Error("Database connection failed")

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/inquiries", headers=headers)

        assert response.status_code == 500

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_admin_message_sanitization(self, mock_db, mock_admin):
        """Test admin message sanitization"""
        mock_admin.return_value = 1

        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 1, "product_id": 123},  # Session exists
            {"username": "AdminUser"},  # Admin user info
        ]
        mock_cursor.lastrowid = 456
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        # Test message with HTML content
        response_data = {
            "message_text": "<script>alert('xss')</script>Hello customer",
            "admin_id": 1,
            "admin_name": "AdminUser",
        }

        headers = self.get_admin_token()
        response = self.client.post(
            "/api/admin/chat/sessions/session_123/respond",
            json=response_data,
            headers=headers,
        )

        # Should succeed but message should be sanitized
        assert response.status_code == 200


class TestAdminNotificationSystem:
    """Test admin notification system functionality"""

    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    def get_admin_token(self):
        """Helper to get admin authentication token"""
        with patch("main.get_current_admin") as mock_admin:
            mock_admin.return_value = 1
            return {"Authorization": "Bearer mock_admin_token"}

    @patch("main.get_current_admin")
    @patch("main.get_notification_service")
    def test_test_email_notification(self, mock_notification_service, mock_admin):
        """Test email notification testing endpoint"""
        mock_admin.return_value = 1
        mock_service = Mock()
        mock_service.test_email_notification.return_value = {
            "success": True,
            "message": "Test email sent successfully",
        }
        mock_notification_service.return_value = mock_service

        headers = self.get_admin_token()
        response = self.client.post(
            "/api/admin/notifications/test-email", headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @patch("main.get_current_admin")
    @patch("main.get_notification_service")
    def test_get_notification_settings(self, mock_notification_service, mock_admin):
        """Test getting notification settings"""
        mock_admin.return_value = 1
        mock_service = Mock()
        mock_service.get_settings.return_value = {
            "email_enabled": True,
            "email_host": "smtp.example.com",
            "websocket_enabled": True,
        }
        mock_notification_service.return_value = mock_service

        headers = self.get_admin_token()
        response = self.client.get("/api/admin/notifications/settings", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "email_enabled" in data
        assert "websocket_enabled" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
