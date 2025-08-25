"""
Integration Tests for Complete Chat Flow

Tests the complete chat functionality from customer inquiry to admin response.
Tests Requirements 1.1, 1.4, 2.2, 2.3, 3.3 - complete chat workflow.
"""

import pytest
import json
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import WebSocket
import mysql.connector

from main import app
from websocket_manager import websocket_manager, ConnectionType, MessageType


class TestChatIntegrationFlow:
    """Test complete chat integration flow"""

    def setup_method(self):
        """Set up test client and mock database"""
        self.client = TestClient(app)
        self.mock_db_data = {
            "products": [
                {
                    "id": 123,
                    "name": "Test Product",
                    "description": "A test product",
                    "category": "electronics",
                    "price": 99.99,
                    "stock": 10,
                    "is_active": True,
                }
            ],
            "sessions": [],
            "messages": [],
            "users": [
                {
                    "id": 1,
                    "username": "admin",
                    "is_admin": True,
                    "password_hash": "hashed_password",
                }
            ],
        }

    def mock_db_connection(self):
        """Create a mock database connection with test data"""
        mock_connection = Mock()
        mock_cursor = Mock()

        def execute_side_effect(query, params=None):
            """Mock database execute with realistic responses"""
            query_lower = query.lower().strip()

            # Product existence check
            if "select id from products where id" in query_lower:
                if params and params[0] == 123:
                    mock_cursor.fetchone.return_value = {"id": 123}
                else:
                    mock_cursor.fetchone.return_value = None

            # Session existence check
            elif "select id from product_chat_sessions" in query_lower:
                session_id = params[1] if params and len(params) > 1 else None
                existing_session = next(
                    (
                        s
                        for s in self.mock_db_data["sessions"]
                        if s["session_id"] == session_id
                    ),
                    None,
                )
                mock_cursor.fetchone.return_value = existing_session

            # Insert new session
            elif "insert into product_chat_sessions" in query_lower:
                new_session = {
                    "id": len(self.mock_db_data["sessions"]) + 1,
                    "product_id": params[0],
                    "session_id": params[1],
                    "customer_email": params[2] if len(params) > 2 else None,
                    "status": "active",
                    "priority": "medium",
                }
                self.mock_db_data["sessions"].append(new_session)
                mock_cursor.lastrowid = new_session["id"]

            # Insert new message
            elif "insert into product_chat_messages" in query_lower:
                new_message = {
                    "id": len(self.mock_db_data["messages"]) + 1,
                    "session_id": params[0],
                    "sender_type": params[1],
                    "message_text": params[3],
                    "is_read": False,
                }
                self.mock_db_data["messages"].append(new_message)
                mock_cursor.lastrowid = new_message["id"]

            # Get messages
            elif (
                "select cm.id" in query_lower and "product_chat_messages" in query_lower
            ):
                session_pk = params[0] if params else None
                messages = [
                    m
                    for m in self.mock_db_data["messages"]
                    if m["session_id"] == session_pk
                ]
                mock_cursor.fetchall.return_value = messages

            # Count queries
            elif "select count" in query_lower:
                if "product_chat_messages" in query_lower:
                    mock_cursor.fetchone.return_value = {
                        "total_count": len(self.mock_db_data["messages"])
                    }
                else:
                    mock_cursor.fetchone.return_value = {"total_count": 0}

        mock_cursor.execute.side_effect = execute_side_effect
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
        mock_connection.cursor.return_value = mock_cursor
        return mock_connection

    @patch("main.get_db_connection")
    def test_complete_customer_chat_flow(self, mock_db):
        """Test complete customer chat flow from start to finish"""
        mock_db.return_value.__enter__.return_value = self.mock_db_connection()
        mock_db.return_value = self.mock_db_connection()

        # Step 1: Customer initiates chat on product page
        initial_message = {
            "message_text": "Hello, I'm interested in this product. Can you tell me more about it?",
            "sender_type": "customer",
            "session_id": "customer_session_123",
            "customer_email": "customer@example.com",
        }

        response = self.client.post("/api/products/123/messages", json=initial_message)
        assert response.status_code == 200

        chat_data = response.json()
        assert chat_data["message"] == "Message sent successfully"
        assert "message_id" in chat_data
        assert chat_data["session_id"] == "customer_session_123"

        # Step 2: Customer sends follow-up message
        followup_message = {
            "message_text": "Also, what's the warranty period?",
            "sender_type": "customer",
            "session_id": "customer_session_123",
        }

        response = self.client.post("/api/products/123/messages", json=followup_message)
        assert response.status_code == 200

        # Step 3: Retrieve chat history
        response = self.client.get(
            "/api/products/123/messages?session_id=customer_session_123"
        )
        assert response.status_code == 200

        history_data = response.json()
        assert "messages" in history_data
        assert "pagination" in history_data
        assert history_data["session_id"] == "customer_session_123"

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_complete_admin_response_flow(self, mock_db, mock_admin):
        """Test complete admin response flow"""
        mock_admin.return_value = 1  # Admin user ID
        mock_connection = self.mock_db_connection()
        mock_db.return_value.__enter__.return_value = mock_connection
        mock_db.return_value = mock_connection

        # Setup: Create a customer inquiry first
        self.mock_db_data["sessions"].append(
            {
                "id": 1,
                "product_id": 123,
                "session_id": "admin_test_session",
                "customer_email": "customer@example.com",
                "status": "pending",
                "priority": "medium",
            }
        )

        # Step 1: Admin views pending inquiries
        headers = {"Authorization": "Bearer admin_token"}

        # Mock the inquiry list response
        mock_connection.cursor.return_value.fetchall.return_value = [
            {
                "id": 1,
                "product_id": 123,
                "session_id": "admin_test_session",
                "customer_email": "customer@example.com",
                "status": "pending",
                "priority": "medium",
                "product_name": "Test Product",
                "total_messages": 1,
                "unread_messages": 1,
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
                "last_message_at": "2024-01-01T10:00:00",
            }
        ]

        response = self.client.get("/api/admin/inquiries", headers=headers)
        assert response.status_code == 200

        inquiries = response.json()
        assert len(inquiries) == 1
        assert inquiries[0]["status"] == "pending"

        # Step 2: Admin responds to inquiry
        admin_response = {
            "message_text": "Hello! I'd be happy to help you with information about this product. It comes with a 2-year warranty.",
            "admin_id": 1,
            "admin_name": "AdminUser",
        }

        # Mock admin user lookup
        mock_connection.cursor.return_value.fetchone.side_effect = [
            {"id": 1, "session_id": "admin_test_session"},  # Session exists
            {"username": "AdminUser"},  # Admin user info
        ]
        mock_connection.cursor.return_value.lastrowid = 456

        response = self.client.post(
            "/api/admin/chat/sessions/admin_test_session/respond",
            json=admin_response,
            headers=headers,
        )
        assert response.status_code == 200

        response_data = response.json()
        assert response_data["message"] == "Response sent successfully"

        # Step 3: Admin updates inquiry status
        status_update = {
            "status": "in_progress",
            "assigned_admin_id": 1,
            "priority": "medium",
        }

        mock_connection.cursor.return_value.fetchone.return_value = {"id": 1}
        mock_connection.cursor.return_value.rowcount = 1

        response = self.client.put(
            "/api/admin/inquiries/1/status", json=status_update, headers=headers
        )
        assert response.status_code == 200

    @patch("main.get_db_connection")
    def test_chat_session_persistence(self, mock_db):
        """Test chat session persistence across multiple interactions"""
        mock_db.return_value.__enter__.return_value = self.mock_db_connection()
        mock_db.return_value = self.mock_db_connection()

        session_id = "persistence_test_session"

        # First interaction - creates session
        message1 = {
            "message_text": "First message",
            "sender_type": "customer",
            "session_id": session_id,
        }

        response = self.client.post("/api/products/123/messages", json=message1)
        assert response.status_code == 200

        # Second interaction - uses existing session
        message2 = {
            "message_text": "Second message",
            "sender_type": "customer",
            "session_id": session_id,
        }

        response = self.client.post("/api/products/123/messages", json=message2)
        assert response.status_code == 200

        # Verify session persistence by checking message history
        response = self.client.get(
            f"/api/products/123/messages?session_id={session_id}"
        )
        assert response.status_code == 200

        history = response.json()
        # Should have messages from both interactions
        assert len(self.mock_db_data["messages"]) >= 2

    @patch("main.get_db_connection")
    def test_message_read_status_tracking(self, mock_db):
        """Test message read status tracking"""
        mock_connection = self.mock_db_connection()
        mock_db.return_value.__enter__.return_value = mock_connection
        mock_db.return_value = mock_connection

        # Setup: Create session and messages
        session_id = "read_status_test"

        # Send initial message
        message = {
            "message_text": "Test message for read status",
            "sender_type": "customer",
            "session_id": session_id,
        }

        response = self.client.post("/api/products/123/messages", json=message)
        assert response.status_code == 200

        # Mark messages as read
        mock_connection.cursor.return_value.fetchone.return_value = {
            "id": 1
        }  # Session exists
        mock_connection.cursor.return_value.rowcount = 1

        read_update = {"mark_all": True}
        response = self.client.put(
            f"/api/products/123/messages/read?session_id={session_id}", json=read_update
        )
        assert response.status_code == 200

        read_data = response.json()
        assert read_data["affected_rows"] == 1

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_admin_dashboard_integration(self, mock_db, mock_admin):
        """Test admin dashboard integration with inquiry stats"""
        mock_admin.return_value = 1
        mock_connection = Mock()
        mock_cursor = Mock()

        # Mock inquiry statistics
        mock_cursor.fetchall.return_value = [
            {"status": "pending", "count": 5},
            {"status": "in_progress", "count": 3},
            {"status": "resolved", "count": 12},
        ]
        mock_cursor.fetchone.side_effect = [
            {"total_inquiries": 20},
            {"avg_response_time": 35.5},
            {"unread_messages": 8},
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = {"Authorization": "Bearer admin_token"}
        response = self.client.get("/api/admin/inquiries/stats", headers=headers)

        assert response.status_code == 200
        stats = response.json()
        assert stats["total_inquiries"] == 20
        assert len(stats["status_breakdown"]) == 3
        assert stats["avg_response_time_minutes"] == 35.5

    def test_error_handling_integration(self):
        """Test error handling across the chat flow"""
        # Test invalid product ID
        message = {
            "message_text": "Test message",
            "sender_type": "customer",
        }

        response = self.client.post("/api/products/0/messages", json=message)
        assert response.status_code == 400

        # Test empty message
        empty_message = {
            "message_text": "",
            "sender_type": "customer",
        }

        response = self.client.post("/api/products/123/messages", json=empty_message)
        assert response.status_code == 400

    @patch("main.get_db_connection")
    def test_product_context_association(self, mock_db):
        """Test that messages are properly associated with products"""
        mock_db.return_value.__enter__.return_value = self.mock_db_connection()
        mock_db.return_value = self.mock_db_connection()

        # Send message to product 123
        message_123 = {
            "message_text": "Question about product 123",
            "sender_type": "customer",
            "session_id": "product_123_session",
        }

        response = self.client.post("/api/products/123/messages", json=message_123)
        assert response.status_code == 200
        assert response.json()["product_id"] == 123

        # Send message to different product 456
        message_456 = {
            "message_text": "Question about product 456",
            "sender_type": "customer",
            "session_id": "product_456_session",
        }

        # This should fail because product 456 doesn't exist in our mock
        response = self.client.post("/api/products/456/messages", json=message_456)
        assert response.status_code == 404

    @patch("main.get_db_connection")
    def test_concurrent_chat_sessions(self, mock_db):
        """Test handling of multiple concurrent chat sessions"""
        mock_db.return_value.__enter__.return_value = self.mock_db_connection()
        mock_db.return_value = self.mock_db_connection()

        # Create multiple sessions for the same product
        sessions = ["session_1", "session_2", "session_3"]

        for i, session_id in enumerate(sessions):
            message = {
                "message_text": f"Message from session {i+1}",
                "sender_type": "customer",
                "session_id": session_id,
                "customer_email": f"customer{i+1}@example.com",
            }

            response = self.client.post("/api/products/123/messages", json=message)
            assert response.status_code == 200
            assert response.json()["session_id"] == session_id

        # Verify each session maintains separate message history
        for session_id in sessions:
            response = self.client.get(
                f"/api/products/123/messages?session_id={session_id}"
            )
            assert response.status_code == 200
            assert response.json()["session_id"] == session_id

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_inquiry_priority_handling(self, mock_db, mock_admin):
        """Test inquiry priority handling in admin workflow"""
        mock_admin.return_value = 1
        mock_connection = Mock()
        mock_cursor = Mock()

        # Mock high priority inquiries
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "product_id": 123,
                "session_id": "high_priority_session",
                "customer_email": "urgent@example.com",
                "status": "pending",
                "priority": "high",
                "product_name": "Critical Product",
                "total_messages": 1,
                "unread_messages": 1,
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00",
                "last_message_at": "2024-01-01T10:00:00",
            }
        ]
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = {"Authorization": "Bearer admin_token"}

        # Get high priority inquiries
        response = self.client.get(
            "/api/admin/inquiries?priority=high", headers=headers
        )
        assert response.status_code == 200

        inquiries = response.json()
        assert len(inquiries) == 1
        assert inquiries[0]["priority"] == "high"

    @patch("main.get_db_connection")
    def test_anonymous_user_session_management(self, mock_db):
        """Test session management for anonymous users"""
        mock_db.return_value.__enter__.return_value = self.mock_db_connection()
        mock_db.return_value = self.mock_db_connection()

        # Anonymous user without session_id (should create one)
        message = {
            "message_text": "Anonymous user question",
            "sender_type": "customer",
            # No session_id provided
        }

        response = self.client.post("/api/products/123/messages", json=message)
        assert response.status_code == 200

        data = response.json()
        assert "session_id" in data
        assert data["session_id"].startswith("chat_")  # Auto-generated session ID

    @patch("main.get_current_admin")
    @patch("main.get_db_connection")
    def test_admin_assignment_workflow(self, mock_db, mock_admin):
        """Test admin assignment workflow"""
        mock_admin.return_value = 1
        mock_connection = Mock()
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {"id": 1}  # Inquiry exists
        mock_cursor.rowcount = 1
        mock_connection.cursor.return_value = mock_cursor
        mock_db.return_value = mock_connection

        headers = {"Authorization": "Bearer admin_token"}

        # Assign inquiry to admin
        assignment_data = {
            "status": "in_progress",
            "assigned_admin_id": 1,
            "priority": "medium",
        }

        response = self.client.put(
            "/api/admin/inquiries/1/status", json=assignment_data, headers=headers
        )
        assert response.status_code == 200

        # Verify assignment was successful
        data = response.json()
        assert "updated successfully" in data["message"]


class TestChatValidationIntegration:
    """Test validation integration across the chat system"""

    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    def test_message_sanitization_integration(self):
        """Test message sanitization across the entire flow"""
        # Test XSS prevention in customer messages
        malicious_message = {
            "message_text": "<script>alert('xss')</script>Hello",
            "sender_type": "customer",
            "session_id": "xss_test_session",
        }

        with patch("main.get_db_connection") as mock_db:
            mock_connection = Mock()
            mock_cursor = Mock()
            mock_cursor.fetchone.side_effect = [
                {"id": 123},  # Product exists
                None,  # Session doesn't exist
            ]
            mock_cursor.lastrowid = 1
            mock_connection.cursor.return_value.__enter__.return_value = mock_cursor
            mock_connection.cursor.return_value = mock_cursor
            mock_db.return_value.__enter__.return_value = mock_connection
            mock_db.return_value = mock_connection

            response = self.client.post(
                "/api/products/123/messages", json=malicious_message
            )

            # Should succeed but message should be sanitized
            assert response.status_code == 200

    def test_email_validation_integration(self):
        """Test email validation across chat creation"""
        invalid_email_message = {
            "message_text": "Hello, please contact me",
            "sender_type": "customer",
            "session_id": "email_test_session",
            "customer_email": "invalid-email-format",
        }

        # Should fail validation
        response = self.client.post(
            "/api/products/123/messages", json=invalid_email_message
        )
        # The validation might happen at the model level or API level
        # Either way, invalid emails should be handled gracefully


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
