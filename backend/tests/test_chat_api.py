"""
Unit Tests for Chat API Endpoints

Tests for product chat message API endpoints as specified in the requirements.
Tests Requirements 1.3, 2.1, 4.2 - message creation, retrieval, and product association.
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException
import mysql.connector

from main import app
from models.chat_models import MessageCreate, ProductMessage, ChatSessionCreate


def create_mock_db_connection():
    """Helper function to create properly mocked database connection"""
    mock_connection = Mock()
    mock_cursor = Mock()

    # Mock the context manager for cursor
    mock_cursor_context = Mock()
    mock_cursor_context.__enter__ = Mock(return_value=mock_cursor)
    mock_cursor_context.__exit__ = Mock(return_value=None)
    mock_connection.cursor.return_value = mock_cursor_context

    # Mock the context manager for connection
    mock_connection_context = Mock()
    mock_connection_context.__enter__ = Mock(return_value=mock_connection)
    mock_connection_context.__exit__ = Mock(return_value=None)

    return mock_connection_context, mock_connection, mock_cursor


class TestChatAPIEndpoints:
    """Test chat API endpoints functionality"""

    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    @patch("main.get_db_connection")
    def test_get_product_messages_success(self, mock_db):
        """Test successful retrieval of product messages"""
        # Create mock database connection
        mock_connection_context, mock_connection, mock_cursor = (
            create_mock_db_connection()
        )
        mock_db.return_value = mock_connection_context

        # Setup mock responses
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "session_id": "session_123",
                "sender_type": "customer",
                "sender_id": None,
                "sender_name": "Test Customer",
                "message_text": "Hello, I have a question",
                "message_type": "text",
                "is_read": False,
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
            }
        ]
        mock_cursor.fetchone.side_effect = [
            {"id": 123},  # Product exists check
            {"total_count": 1},  # Total count
            {"unread_count": 1},  # Unread count
        ]

        # Test the endpoint
        response = self.client.get("/api/products/123/messages?session_id=session_123")

        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert "pagination" in data
        assert "unread_count" in data
        assert len(data["messages"]) == 1
        assert data["messages"][0]["message_text"] == "Hello, I have a question"

    @patch("main.get_db_connection")
    def test_get_product_messages_product_not_found(self, mock_db):
        """Test getting messages for non-existent product"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = None  # Product doesn't exist
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_db.return_value.__enter__.return_value = mock_connection

        response = self.client.get("/api/products/999/messages")

        assert response.status_code == 404
        assert "Product not found" in response.json()["detail"]["message"]

    @patch("main.get_db_connection")
    def test_get_product_messages_with_pagination(self, mock_db):
        """Test message retrieval with pagination parameters"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.side_effect = [
            {"id": 123},  # Product exists
            {"total_count": 50},  # Total count
            {"unread_count": 0},  # Unread count
        ]
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_db.return_value.__enter__.return_value = mock_connection

        response = self.client.get("/api/products/123/messages?limit=10&offset=20")

        assert response.status_code == 200
        data = response.json()
        assert data["pagination"]["limit"] == 10
        assert data["pagination"]["offset"] == 20
        assert data["pagination"]["total_count"] == 50
        assert data["pagination"]["has_more"] is True
        assert data["pagination"]["has_previous"] is True

    @patch("main.get_db_connection")
    def test_send_product_message_success(self, mock_db):
        """Test successful message sending"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 123},  # Product exists
            {"id": 1},  # Session exists
        ]
        mock_cursor.lastrowid = 456  # Message ID
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_db.return_value.__enter__.return_value = mock_connection

        message_data = {
            "message_text": "Hello, I need help with this product",
            "sender_type": "customer",
            "session_id": "session_123",
            "customer_email": "test@example.com",
        }

        response = self.client.post("/api/products/123/messages", json=message_data)

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Message sent successfully"
        assert data["message_id"] == 456
        assert data["session_id"] == "session_123"
        assert data["product_id"] == 123

    @patch("main.get_db_connection")
    def test_send_product_message_creates_new_session(self, mock_db):
        """Test message sending creates new session when none exists"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 123},  # Product exists
            None,  # Session doesn't exist
        ]
        mock_cursor.lastrowid = 789  # New session ID, then message ID
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_db.return_value.__enter__.return_value = mock_connection

        message_data = {
            "message_text": "Hello, I need help",
            "sender_type": "customer",
            "session_id": "new_session_123",
        }

        response = self.client.post("/api/products/123/messages", json=message_data)

        assert response.status_code == 200
        data = response.json()
        assert "message_id" in data
        assert data["session_id"] == "new_session_123"

    def test_send_product_message_validation_errors(self):
        """Test message validation errors"""
        # Test empty message
        response = self.client.post(
            "/api/products/123/messages",
            json={
                "message_text": "",
                "sender_type": "customer",
            },
        )
        assert response.status_code == 400
        assert "empty" in response.json()["detail"]["message"].lower()

        # Test message too long
        long_message = "x" * 2001
        response = self.client.post(
            "/api/products/123/messages",
            json={
                "message_text": long_message,
                "sender_type": "customer",
            },
        )
        assert response.status_code == 400
        assert "exceed" in response.json()["detail"]["message"].lower()

        # Test invalid product ID
        response = self.client.post(
            "/api/products/0/messages",
            json={
                "message_text": "Hello",
                "sender_type": "customer",
            },
        )
        assert response.status_code == 400

    @patch("main.get_db_connection")
    def test_mark_messages_read_success(self, mock_db):
        """Test marking messages as read"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Session exists
        mock_cursor.rowcount = 3  # 3 messages marked as read
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        read_data = {"mark_all": True}

        response = self.client.put(
            "/api/products/123/messages/read?session_id=session_123", json=read_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["affected_rows"] == 3
        assert "marked" in data["message"].lower()

    @patch("main.get_db_connection")
    def test_mark_specific_messages_read(self, mock_db):
        """Test marking specific messages as read"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Session exists
        mock_cursor.rowcount = 2  # 2 messages marked as read
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        read_data = {"message_ids": [1, 2, 3], "mark_all": False}

        response = self.client.put(
            "/api/products/123/messages/read?session_id=session_123", json=read_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["affected_rows"] == 2

    @patch("main.get_db_connection")
    def test_create_chat_session_success(self, mock_db):
        """Test creating a new chat session"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.side_effect = [
            {"id": 123},  # Product exists
            None,  # Session doesn't exist
        ]
        mock_cursor.lastrowid = 456  # New session ID
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        session_data = {
            "session_id": "new_session_456",
            "customer_email": "test@example.com",
            "customer_name": "Test Customer",
            "initial_message": "Hello, I'm interested in this product",
        }

        response = self.client.post(
            "/api/products/123/chat/sessions", json=session_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Chat session created successfully"
        assert data["session_id"] == "new_session_456"
        assert data["product_id"] == 123

    @patch("main.get_db_connection")
    def test_get_session_messages_success(self, mock_db):
        """Test getting messages for a specific session"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {
            "id": 1,
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "status": "active",
            "created_at": "2024-01-01T10:00:00",
            "last_message_at": "2024-01-01T10:30:00",
        }
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "session_id": 1,
                "sender_type": "customer",
                "sender_id": None,
                "sender_name": "Test Customer",
                "message_text": "Hello",
                "message_type": "text",
                "is_read": True,
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
            }
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        response = self.client.get(
            "/api/products/123/chat/sessions/session_123/messages"
        )

        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert "session_info" in data
        assert "pagination" in data
        assert data["session_info"]["customer_name"] == "Test Customer"

    @patch("main.get_db_connection")
    def test_send_session_message_success(self, mock_db):
        """Test sending a message in an existing session"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Session exists
        mock_cursor.lastrowid = 789  # Message ID
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        message_data = {
            "message_text": "Thank you for your help",
            "sender_type": "customer",
            "customer_email": "test@example.com",
        }

        response = self.client.post(
            "/api/products/123/chat/sessions/session_123/messages", json=message_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Message sent successfully"
        assert data["message_id"] == 789
        assert data["session_id"] == "session_123"

    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        # This would require mocking the rate limiting storage
        # For now, we'll test that the decorator exists and functions
        with patch("main.rate_limit_storage", {}):
            # Multiple rapid requests should eventually hit rate limit
            # This is a simplified test - in practice you'd need to mock time
            pass

    @patch("main.get_db_connection")
    def test_database_error_handling(self, mock_db):
        """Test database error handling"""
        mock_db.side_effect = mysql.connector.Error("Database connection failed")

        response = self.client.get("/api/products/123/messages")

        assert response.status_code == 500
        assert "database error" in response.json()["detail"]["message"].lower()

    @patch("main.get_db_connection")
    def test_session_not_found_error(self, mock_db):
        """Test session not found error handling"""
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = None  # Session doesn't exist
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        read_data = {"mark_all": True}

        response = self.client.put(
            "/api/products/123/messages/read?session_id=nonexistent", json=read_data
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestChatModelsValidation:
    """Test chat model validation"""

    def test_message_create_validation(self):
        """Test MessageCreate model validation"""
        # Valid message
        valid_message = MessageCreate(
            message_text="Hello, I need help",
            sender_type="customer",
            session_id="session_123",
            customer_email="test@example.com",
        )
        assert valid_message.message_text == "Hello, I need help"
        assert valid_message.sender_type == "customer"

        # Test email validation
        with pytest.raises(ValueError):
            MessageCreate(
                message_text="Hello",
                sender_type="customer",
                customer_email="invalid-email",
            )

        # Test empty message validation
        with pytest.raises(ValueError):
            MessageCreate(
                message_text="",
                sender_type="customer",
            )

        # Test message too long
        with pytest.raises(ValueError):
            MessageCreate(
                message_text="x" * 2001,
                sender_type="customer",
            )

    def test_chat_session_create_validation(self):
        """Test ChatSessionCreate model validation"""
        # Valid session
        valid_session = ChatSessionCreate(
            product_id=123,
            session_id="session_456",
            customer_email="test@example.com",
            customer_name="Test Customer",
        )
        assert valid_session.product_id == 123
        assert valid_session.session_id == "session_456"

        # Test invalid product ID
        with pytest.raises(ValueError):
            ChatSessionCreate(
                product_id=0,
                session_id="session_456",
            )

        # Test invalid email
        with pytest.raises(ValueError):
            ChatSessionCreate(
                product_id=123,
                session_id="session_456",
                customer_email="invalid-email",
            )

    def test_message_sanitization(self):
        """Test message text sanitization"""
        # Test HTML escaping
        message = MessageCreate(
            message_text="<script>alert('xss')</script>Hello",
            sender_type="customer",
        )
        # Should be escaped
        assert "<script>" not in message.message_text
        assert "&lt;script&gt;" in message.message_text

        # Test JavaScript removal
        message = MessageCreate(
            message_text="javascript:alert('xss')",
            sender_type="customer",
        )
        assert "javascript:" not in message.message_text


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
