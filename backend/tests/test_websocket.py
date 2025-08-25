"""
WebSocket Tests for Real-time Chat Functionality

Tests for WebSocket connection management, message delivery, and error handling
as specified in Requirements 1.4 and 3.3.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import WebSocket, WebSocketDisconnect

# Import the modules we're testing
from websocket_manager import (
    WebSocketManager,
    WebSocketConnection,
    ConnectionType,
    MessageType,
    websocket_manager,
    cleanup_task,
)
from main import app


class TestWebSocketConnection:
    """Test WebSocketConnection class functionality"""

    def test_connection_creation(self):
        """Test WebSocket connection object creation"""
        mock_websocket = Mock()
        mock_websocket.client_state.name = "CONNECTED"

        connection = WebSocketConnection(
            websocket=mock_websocket,
            connection_id="test_conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
            product_id=123,
            user_name="Test User",
        )

        assert connection.connection_id == "test_conn_1"
        assert connection.connection_type == ConnectionType.CUSTOMER
        assert connection.session_id == "test_session"
        assert connection.product_id == 123
        assert connection.user_name == "Test User"
        assert connection.is_typing is False
        assert connection.is_connected() is True

    @pytest.mark.asyncio
    async def test_send_message_success(self):
        """Test successful message sending"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        connection = WebSocketConnection(
            websocket=mock_websocket,
            connection_id="test_conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        test_message = {"type": "chat_message", "content": "Hello"}
        await connection.send_message(test_message)

        mock_websocket.send_text.assert_called_once_with(json.dumps(test_message))

    @pytest.mark.asyncio
    async def test_send_message_failure(self):
        """Test message sending failure handling"""
        mock_websocket = AsyncMock()
        mock_websocket.send_text.side_effect = Exception("Connection closed")

        connection = WebSocketConnection(
            websocket=mock_websocket,
            connection_id="test_conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        test_message = {"type": "chat_message", "content": "Hello"}

        with pytest.raises(Exception):
            await connection.send_message(test_message)

    def test_to_dict_serialization(self):
        """Test connection serialization to dictionary"""
        mock_websocket = Mock()
        connection = WebSocketConnection(
            websocket=mock_websocket,
            connection_id="test_conn_1",
            connection_type=ConnectionType.ADMIN,
            session_id="test_session",
            product_id=456,
            user_id=789,
            user_name="Admin User",
        )

        result = connection.to_dict()

        assert result["connection_id"] == "test_conn_1"
        assert result["connection_type"] == "admin"
        assert result["session_id"] == "test_session"
        assert result["product_id"] == 456
        assert result["user_id"] == 789
        assert result["user_name"] == "Admin User"
        assert "connected_at" in result
        assert "last_activity" in result


class TestWebSocketManager:
    """Test WebSocketManager class functionality"""

    def setup_method(self):
        """Set up fresh WebSocketManager for each test"""
        self.manager = WebSocketManager()

    @pytest.mark.asyncio
    async def test_customer_connection(self):
        """Test customer WebSocket connection"""
        mock_websocket = AsyncMock()

        connection = await self.manager.connect(
            websocket=mock_websocket,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            product_id=456,
            user_name="Customer",
        )

        # Verify connection is stored
        assert "customer_1" in self.manager.connections
        assert connection.connection_type == ConnectionType.CUSTOMER
        assert connection.session_id == "session_123"
        assert connection.product_id == 456

        # Verify session grouping
        assert "session_123" in self.manager.session_connections
        assert "customer_1" in self.manager.session_connections["session_123"]

        # Verify product grouping
        assert 456 in self.manager.product_connections
        assert "customer_1" in self.manager.product_connections[456]

        # Verify WebSocket accept was called
        mock_websocket.accept.assert_called_once()

    @pytest.mark.asyncio
    async def test_admin_connection(self):
        """Test admin WebSocket connection"""
        mock_websocket = AsyncMock()

        connection = await self.manager.connect(
            websocket=mock_websocket,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=789,
            user_name="Admin User",
        )

        # Verify connection is stored
        assert "admin_1" in self.manager.connections
        assert connection.connection_type == ConnectionType.ADMIN

        # Verify admin grouping
        assert "admin_1" in self.manager.admin_connections

        # Verify WebSocket accept was called
        mock_websocket.accept.assert_called_once()

    @pytest.mark.asyncio
    async def test_disconnect_cleanup(self):
        """Test connection cleanup on disconnect"""
        mock_websocket = AsyncMock()

        # Connect first
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="test_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
            product_id=123,
        )

        # Verify connection exists
        assert "test_conn" in self.manager.connections
        assert "test_session" in self.manager.session_connections
        assert 123 in self.manager.product_connections

        # Disconnect
        await self.manager.disconnect("test_conn")

        # Verify cleanup
        assert "test_conn" not in self.manager.connections
        assert "test_session" not in self.manager.session_connections
        assert 123 not in self.manager.product_connections

    @pytest.mark.asyncio
    async def test_send_to_connection_success(self):
        """Test sending message to specific connection"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Connect first
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="test_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        test_message = {"type": "test", "content": "Hello"}
        result = await self.manager.send_to_connection("test_conn", test_message)

        assert result is True
        mock_websocket.send_text.assert_called_with(json.dumps(test_message))

    @pytest.mark.asyncio
    async def test_send_to_nonexistent_connection(self):
        """Test sending message to non-existent connection"""
        test_message = {"type": "test", "content": "Hello"}
        result = await self.manager.send_to_connection("nonexistent", test_message)

        assert result is False

    @pytest.mark.asyncio
    async def test_broadcast_to_session(self):
        """Test broadcasting message to all connections in a session"""
        # Create multiple connections in same session
        mock_websocket1 = AsyncMock()
        mock_websocket1.client_state.name = "CONNECTED"
        mock_websocket2 = AsyncMock()
        mock_websocket2.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=mock_websocket1,
            connection_id="conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="shared_session",
        )

        await self.manager.connect(
            websocket=mock_websocket2,
            connection_id="conn_2",
            connection_type=ConnectionType.ADMIN,
            session_id="shared_session",
        )

        test_message = {"type": "broadcast", "content": "Hello all"}
        await self.manager.broadcast_to_session("shared_session", test_message)

        # Both connections should receive the message
        mock_websocket1.send_text.assert_called_with(json.dumps(test_message))
        mock_websocket2.send_text.assert_called_with(json.dumps(test_message))

    @pytest.mark.asyncio
    async def test_broadcast_to_session_with_exclusion(self):
        """Test broadcasting with connection exclusion"""
        mock_websocket1 = AsyncMock()
        mock_websocket1.client_state.name = "CONNECTED"
        mock_websocket2 = AsyncMock()
        mock_websocket2.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=mock_websocket1,
            connection_id="conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="shared_session",
        )

        await self.manager.connect(
            websocket=mock_websocket2,
            connection_id="conn_2",
            connection_type=ConnectionType.ADMIN,
            session_id="shared_session",
        )

        # Reset mock call counts after connection setup
        mock_websocket1.send_text.reset_mock()
        mock_websocket2.send_text.reset_mock()

        test_message = {"type": "broadcast", "content": "Hello all"}
        await self.manager.broadcast_to_session(
            "shared_session", test_message, exclude_connection="conn_1"
        )

        # Only conn_2 should receive the message
        mock_websocket1.send_text.assert_not_called()
        mock_websocket2.send_text.assert_called_with(json.dumps(test_message))

    @pytest.mark.asyncio
    async def test_broadcast_to_admins(self):
        """Test broadcasting message to all admin connections"""
        # Create admin and customer connections
        mock_admin_ws = AsyncMock()
        mock_admin_ws.client_state.name = "CONNECTED"
        mock_customer_ws = AsyncMock()
        mock_customer_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=mock_admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=1,
        )

        await self.manager.connect(
            websocket=mock_customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_1",
        )

        # Reset mock call counts after connection setup
        mock_admin_ws.send_text.reset_mock()
        mock_customer_ws.send_text.reset_mock()

        test_message = {"type": "admin_notification", "content": "New inquiry"}
        await self.manager.broadcast_to_admins(test_message)

        # Only admin should receive the message
        mock_admin_ws.send_text.assert_called_with(json.dumps(test_message))
        mock_customer_ws.send_text.assert_not_called()

    @pytest.mark.asyncio
    async def test_broadcast_to_product(self):
        """Test broadcasting message to all connections for a specific product"""
        mock_websocket1 = AsyncMock()
        mock_websocket1.client_state.name = "CONNECTED"
        mock_websocket2 = AsyncMock()
        mock_websocket2.client_state.name = "CONNECTED"

        # Connect to same product
        await self.manager.connect(
            websocket=mock_websocket1,
            connection_id="conn_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_1",
            product_id=123,
        )

        await self.manager.connect(
            websocket=mock_websocket2,
            connection_id="conn_2",
            connection_type=ConnectionType.ADMIN,
            product_id=123,
        )

        test_message = {"type": "product_update", "product_id": 123}
        await self.manager.broadcast_to_product(123, test_message)

        # Both connections should receive the message
        mock_websocket1.send_text.assert_called_with(json.dumps(test_message))
        mock_websocket2.send_text.assert_called_with(json.dumps(test_message))

    @pytest.mark.asyncio
    async def test_handle_chat_message(self):
        """Test handling chat message"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Connect customer
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            product_id=456,
            user_name="Test Customer",
        )

        # Mock admin connection for notification
        mock_admin_ws = AsyncMock()
        mock_admin_ws.client_state.name = "CONNECTED"
        await self.manager.connect(
            websocket=mock_admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=1,
        )

        # Handle chat message
        message_data = {
            "type": MessageType.CHAT_MESSAGE.value,
            "message": "Hello, I have a question about this product",
        }

        await self.manager.handle_message("customer_1", message_data)

        # Admin should receive notification
        mock_admin_ws.send_text.assert_called()

    @pytest.mark.asyncio
    async def test_handle_typing_indicator(self):
        """Test handling typing indicator"""
        mock_websocket1 = AsyncMock()
        mock_websocket1.client_state.name = "CONNECTED"
        mock_websocket2 = AsyncMock()
        mock_websocket2.client_state.name = "CONNECTED"

        # Connect two users to same session
        await self.manager.connect(
            websocket=mock_websocket1,
            connection_id="user_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            user_name="User 1",
        )

        await self.manager.connect(
            websocket=mock_websocket2,
            connection_id="user_2",
            connection_type=ConnectionType.ADMIN,
            session_id="session_123",
            user_name="User 2",
        )

        # Reset mock call counts after connection setup
        mock_websocket1.send_text.reset_mock()
        mock_websocket2.send_text.reset_mock()

        # Handle typing indicator
        typing_data = {
            "type": MessageType.TYPING_INDICATOR.value,
            "is_typing": True,
        }

        await self.manager.handle_message("user_1", typing_data)

        # User 2 should receive typing indicator
        mock_websocket2.send_text.assert_called()
        # User 1 should not receive their own typing indicator
        mock_websocket1.send_text.assert_not_called()

    @pytest.mark.asyncio
    async def test_cleanup_inactive_connections(self):
        """Test cleanup of inactive connections"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "DISCONNECTED"  # Simulate disconnected state

        # Connect and then simulate disconnection
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="inactive_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        # Verify connection exists
        assert "inactive_conn" in self.manager.connections

        # Run cleanup
        await self.manager.cleanup_inactive_connections(timeout_minutes=0)

        # Connection should be cleaned up
        assert "inactive_conn" not in self.manager.connections

    def test_get_connection_stats(self):
        """Test getting connection statistics"""
        stats = self.manager.get_connection_stats()

        assert "total_connections" in stats
        assert "customer_connections" in stats
        assert "admin_connections" in stats
        assert "active_sessions" in stats
        assert "connections_by_product" in stats

        # Initially should be empty
        assert stats["total_connections"] == 0
        assert stats["customer_connections"] == 0
        assert stats["admin_connections"] == 0
        assert stats["active_sessions"] == 0

    def test_get_session_info(self):
        """Test getting session information"""
        # Test non-existent session
        result = self.manager.get_session_info("nonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_session_info_with_connections(self):
        """Test getting session information with active connections"""
        mock_websocket = AsyncMock()

        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="test_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
            user_name="Test User",
        )

        result = self.manager.get_session_info("test_session")

        assert result is not None
        assert result["session_id"] == "test_session"
        assert result["connection_count"] == 1
        assert len(result["connections"]) == 1
        assert result["connections"][0]["user_name"] == "Test User"


class TestWebSocketEndpoints:
    """Test WebSocket endpoint functionality"""

    def test_websocket_endpoints_exist(self):
        """Test that WebSocket endpoints are properly defined"""
        # This tests that the endpoints exist in the FastAPI app
        routes = [route.path for route in app.routes]

        assert "/ws/chat/customer/{product_id}/{session_id}" in routes
        assert "/ws/chat/admin/{admin_id}" in routes
        assert "/ws/chat/session/{session_id}" in routes


class TestCleanupTask:
    """Test background cleanup task"""

    @pytest.mark.asyncio
    async def test_cleanup_task_runs(self):
        """Test that cleanup task can run without errors"""
        # Mock the websocket_manager to avoid actual cleanup
        with patch("websocket_manager.websocket_manager") as mock_manager:
            mock_manager.cleanup_inactive_connections = AsyncMock()

            # Run one iteration of cleanup
            with patch("asyncio.sleep", side_effect=asyncio.CancelledError):
                try:
                    await cleanup_task()
                except asyncio.CancelledError:
                    pass  # Expected when we cancel the infinite loop

            # Verify cleanup was called
            mock_manager.cleanup_inactive_connections.assert_called_once()


class TestErrorHandling:
    """Test error handling and recovery mechanisms"""

    def setup_method(self):
        """Set up fresh WebSocketManager for each test"""
        self.manager = WebSocketManager()

    @pytest.mark.asyncio
    async def test_connection_error_recovery(self):
        """Test connection error recovery"""
        mock_websocket = AsyncMock()
        mock_websocket.accept.side_effect = Exception("Connection failed")

        # Connection should handle accept failure gracefully
        with pytest.raises(Exception):
            await self.manager.connect(
                websocket=mock_websocket,
                connection_id="failing_conn",
                connection_type=ConnectionType.CUSTOMER,
            )

        # Manager should not have stored the failed connection
        assert "failing_conn" not in self.manager.connections

    @pytest.mark.asyncio
    async def test_message_send_error_cleanup(self):
        """Test cleanup when message sending fails"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Connect first (this should succeed)
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="failing_send",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        # Verify connection exists
        assert "failing_send" in self.manager.connections

        # Now make send_text fail for subsequent calls
        mock_websocket.send_text.side_effect = Exception("Send failed")

        # Try to send message (should fail and cleanup)
        result = await self.manager.send_to_connection("failing_send", {"type": "test"})

        assert result is False
        # Connection should be cleaned up after send failure
        assert "failing_send" not in self.manager.connections

    @pytest.mark.asyncio
    async def test_broadcast_error_resilience(self):
        """Test that broadcast continues even if some connections fail"""
        # Create multiple connections
        mock_websocket1 = AsyncMock()
        mock_websocket1.client_state.name = "CONNECTED"
        mock_websocket2 = AsyncMock()
        mock_websocket2.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=mock_websocket1,
            connection_id="failing_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        await self.manager.connect(
            websocket=mock_websocket2,
            connection_id="working_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
        )

        # Now make the first connection fail for subsequent sends
        mock_websocket1.send_text.side_effect = Exception("Send failed")

        # Broadcast should continue despite one connection failing
        await self.manager.broadcast_to_session(
            "test_session", {"type": "test", "content": "Hello"}
        )

        # Working connection should receive message
        mock_websocket2.send_text.assert_called()
        # Failing connection should be cleaned up
        assert "failing_conn" not in self.manager.connections
        assert "working_conn" in self.manager.connections


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
