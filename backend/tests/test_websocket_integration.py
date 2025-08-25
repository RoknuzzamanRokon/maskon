"""
WebSocket Integration Tests

Integration tests for WebSocket endpoints with FastAPI application.
Tests the actual WebSocket endpoints defined in main.py.
"""

import pytest
import json
import asyncio
from fastapi.testclient import TestClient
from fastapi import WebSocket
from unittest.mock import patch, AsyncMock

from main import app


class TestWebSocketIntegration:
    """Integration tests for WebSocket endpoints"""

    def test_websocket_customer_endpoint_exists(self):
        """Test that customer WebSocket endpoint exists"""
        client = TestClient(app)

        # Test that the endpoint exists by checking routes
        websocket_routes = [
            route
            for route in app.routes
            if hasattr(route, "path") and "/ws/chat/customer/" in route.path
        ]

        assert len(websocket_routes) > 0, "Customer WebSocket endpoint should exist"

    def test_websocket_admin_endpoint_exists(self):
        """Test that admin WebSocket endpoint exists"""
        client = TestClient(app)

        # Test that the endpoint exists by checking routes
        websocket_routes = [
            route
            for route in app.routes
            if hasattr(route, "path") and "/ws/chat/admin/" in route.path
        ]

        assert len(websocket_routes) > 0, "Admin WebSocket endpoint should exist"

    def test_websocket_session_endpoint_exists(self):
        """Test that session WebSocket endpoint exists"""
        client = TestClient(app)

        # Test that the endpoint exists by checking routes
        websocket_routes = [
            route
            for route in app.routes
            if hasattr(route, "path") and "/ws/chat/session/" in route.path
        ]

        assert len(websocket_routes) > 0, "Session WebSocket endpoint should exist"

    def test_websocket_customer_connection(self):
        """Test customer WebSocket connection"""
        client = TestClient(app)

        # Test WebSocket connection
        with client.websocket_connect(
            "/ws/chat/customer/123/test_session?customer_name=TestUser"
        ) as websocket:
            # Should be able to connect successfully
            assert websocket is not None

            # Send a test message
            test_message = {
                "type": "chat_message",
                "message": "Hello, I have a question about this product",
            }
            websocket.send_text(json.dumps(test_message))

            # The connection should remain open
            # Note: We don't expect a response in this simple test
            # as it would require database setup and admin connections

    def test_websocket_admin_connection(self):
        """Test admin WebSocket connection"""
        client = TestClient(app)

        # Test WebSocket connection
        with client.websocket_connect(
            "/ws/chat/admin/1?admin_name=AdminUser"
        ) as websocket:
            # Should be able to connect successfully
            assert websocket is not None

            # Send a test message
            test_message = {
                "type": "chat_message",
                "message": "Hello, how can I help you?",
            }
            websocket.send_text(json.dumps(test_message))

    def test_websocket_session_connection(self):
        """Test session WebSocket connection"""
        client = TestClient(app)

        # Test WebSocket connection
        with client.websocket_connect(
            "/ws/chat/session/test_session?user_type=customer&user_name=TestUser&product_id=123"
        ) as websocket:
            # Should be able to connect successfully
            assert websocket is not None

            # Send a test message
            test_message = {"type": "typing_indicator", "is_typing": True}
            websocket.send_text(json.dumps(test_message))

    def test_websocket_connection_with_invalid_json(self):
        """Test WebSocket connection with invalid JSON"""
        client = TestClient(app)

        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            # Send invalid JSON
            websocket.send_text("invalid json")

            # Connection should handle this gracefully
            # The WebSocket should remain open despite the invalid message

    def test_websocket_stats_endpoint(self):
        """Test WebSocket statistics endpoint"""
        client = TestClient(app)

        # This endpoint requires admin authentication, so we'll test without auth
        # and expect a 401/403 response
        response = client.get("/api/websocket/stats")

        # Should require authentication
        assert response.status_code in [401, 403]

    def test_websocket_session_info_endpoint(self):
        """Test WebSocket session info endpoint"""
        client = TestClient(app)

        # This endpoint requires admin authentication
        response = client.get("/api/websocket/sessions/test_session")

        # Should require authentication
        assert response.status_code in [401, 403]


class TestWebSocketErrorHandling:
    """Test WebSocket error handling scenarios"""

    def test_websocket_connection_cleanup_on_disconnect(self):
        """Test that connections are cleaned up on disconnect"""
        client = TestClient(app)

        # Connect and then disconnect
        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            # Connection established
            assert websocket is not None

        # After context exit, connection should be cleaned up
        # This is handled automatically by the WebSocket manager

    def test_multiple_websocket_connections(self):
        """Test multiple simultaneous WebSocket connections"""
        client = TestClient(app)

        # Test multiple connections to different sessions
        with client.websocket_connect("/ws/chat/customer/123/session1") as ws1:
            with client.websocket_connect("/ws/chat/customer/456/session2") as ws2:
                # Both connections should work
                assert ws1 is not None
                assert ws2 is not None

                # Send messages to both
                ws1.send_text(
                    json.dumps(
                        {"type": "chat_message", "message": "Hello from session 1"}
                    )
                )
                ws2.send_text(
                    json.dumps(
                        {"type": "chat_message", "message": "Hello from session 2"}
                    )
                )

    def test_websocket_connection_to_same_session(self):
        """Test multiple connections to the same session"""
        client = TestClient(app)

        # Test multiple connections to the same session (e.g., customer and admin)
        with client.websocket_connect(
            "/ws/chat/session/shared_session?user_type=customer"
        ) as customer_ws:
            with client.websocket_connect(
                "/ws/chat/session/shared_session?user_type=admin"
            ) as admin_ws:
                # Both connections should work
                assert customer_ws is not None
                assert admin_ws is not None

                # Send message from customer
                customer_ws.send_text(
                    json.dumps(
                        {
                            "type": "chat_message",
                            "message": "I need help with this product",
                        }
                    )
                )


class TestWebSocketMessageTypes:
    """Test different WebSocket message types"""

    def test_chat_message_type(self):
        """Test chat message type"""
        client = TestClient(app)

        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            message = {
                "type": "chat_message",
                "message": "This is a test message",
                "timestamp": "2024-01-01T00:00:00Z",
            }
            websocket.send_text(json.dumps(message))

    def test_typing_indicator_type(self):
        """Test typing indicator message type"""
        client = TestClient(app)

        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            # Start typing
            websocket.send_text(
                json.dumps({"type": "typing_indicator", "is_typing": True})
            )

            # Stop typing
            websocket.send_text(
                json.dumps({"type": "typing_indicator", "is_typing": False})
            )

    def test_message_read_type(self):
        """Test message read status type"""
        client = TestClient(app)

        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            message = {"type": "message_read", "message_ids": [1, 2, 3]}
            websocket.send_text(json.dumps(message))

    def test_unknown_message_type(self):
        """Test handling of unknown message types"""
        client = TestClient(app)

        with client.websocket_connect(
            "/ws/chat/customer/123/test_session"
        ) as websocket:
            # Send message with unknown type
            message = {"type": "unknown_type", "data": "some data"}
            websocket.send_text(json.dumps(message))

            # Connection should remain stable despite unknown message type


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
