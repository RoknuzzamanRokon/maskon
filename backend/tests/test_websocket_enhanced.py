"""
Enhanced WebSocket Tests for Real-time Chat Functionality

Enhanced tests for WebSocket connection management, message delivery, and error handling
as specified in Requirements 1.4 and 3.3. Builds on existing WebSocket tests.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import WebSocket, WebSocketDisconnect

from websocket_manager import (
    WebSocketManager,
    WebSocketConnection,
    ConnectionType,
    MessageType,
    websocket_manager,
)
from main import app


class TestWebSocketRealTimeMessaging:
    """Test real-time messaging functionality"""

    def setup_method(self):
        """Set up fresh WebSocketManager for each test"""
        self.manager = WebSocketManager()

    @pytest.mark.asyncio
    async def test_real_time_customer_to_admin_messaging(self):
        """Test real-time messaging from customer to admin"""
        # Setup customer connection
        customer_ws = AsyncMock()
        customer_ws.client_state.name = "CONNECTED"

        customer_conn = await self.manager.connect(
            websocket=customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            product_id=456,
            user_name="Test Customer",
        )

        # Setup admin connection
        admin_ws = AsyncMock()
        admin_ws.client_state.name = "CONNECTED"

        admin_conn = await self.manager.connect(
            websocket=admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=1,
            user_name="Admin User",
        )

        # Reset mock call counts after connection setup
        customer_ws.send_text.reset_mock()
        admin_ws.send_text.reset_mock()

        # Customer sends message
        customer_message = {
            "type": MessageType.CHAT_MESSAGE.value,
            "message": "I need help with this product",
            "product_id": 456,
            "session_id": "session_123",
        }

        await self.manager.handle_message("customer_1", customer_message)

        # Admin should receive notification
        admin_ws.send_text.assert_called()

        # Verify the notification content
        call_args = admin_ws.send_text.call_args[0][0]
        notification_data = json.loads(call_args)
        assert notification_data["type"] == "new_inquiry"
        assert notification_data["product_id"] == 456

    @pytest.mark.asyncio
    async def test_real_time_admin_to_customer_response(self):
        """Test real-time admin response to customer"""
        # Setup connections
        customer_ws = AsyncMock()
        customer_ws.client_state.name = "CONNECTED"
        admin_ws = AsyncMock()
        admin_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            user_name="Customer",
        )

        await self.manager.connect(
            websocket=admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=1,
            user_name="Admin",
        )

        # Reset mocks
        customer_ws.send_text.reset_mock()
        admin_ws.send_text.reset_mock()

        # Admin responds to customer
        admin_response = {
            "type": MessageType.CHAT_MESSAGE.value,
            "message": "I can help you with that product",
            "session_id": "session_123",
            "sender_type": "admin",
        }

        await self.manager.handle_message("admin_1", admin_response)

        # Customer should receive the response
        customer_ws.send_text.assert_called()

    @pytest.mark.asyncio
    async def test_typing_indicator_real_time(self):
        """Test real-time typing indicators"""
        # Setup two connections in same session
        user1_ws = AsyncMock()
        user1_ws.client_state.name = "CONNECTED"
        user2_ws = AsyncMock()
        user2_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=user1_ws,
            connection_id="user_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            user_name="User 1",
        )

        await self.manager.connect(
            websocket=user2_ws,
            connection_id="user_2",
            connection_type=ConnectionType.ADMIN,
            session_id="session_123",
            user_name="User 2",
        )

        # Reset mocks
        user1_ws.send_text.reset_mock()
        user2_ws.send_text.reset_mock()

        # User 1 starts typing
        typing_message = {
            "type": MessageType.TYPING_INDICATOR.value,
            "is_typing": True,
            "session_id": "session_123",
        }

        await self.manager.handle_message("user_1", typing_message)

        # User 2 should receive typing indicator
        user2_ws.send_text.assert_called()

        # Verify typing indicator content
        call_args = user2_ws.send_text.call_args[0][0]
        typing_data = json.loads(call_args)
        assert typing_data["type"] == MessageType.TYPING_INDICATOR.value
        assert typing_data["is_typing"] is True
        assert typing_data["user_name"] == "User 1"

        # User 1 should not receive their own typing indicator
        user1_ws.send_text.assert_not_called()

    @pytest.mark.asyncio
    async def test_message_read_status_real_time(self):
        """Test real-time message read status updates"""
        # Setup connections
        customer_ws = AsyncMock()
        customer_ws.client_state.name = "CONNECTED"
        admin_ws = AsyncMock()
        admin_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        await self.manager.connect(
            websocket=admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            session_id="session_123",
        )

        # Reset mocks
        customer_ws.send_text.reset_mock()
        admin_ws.send_text.reset_mock()

        # Customer marks messages as read
        read_message = {
            "type": MessageType.MESSAGE_READ.value,
            "message_ids": [1, 2, 3],
            "session_id": "session_123",
        }

        await self.manager.handle_message("customer_1", read_message)

        # Admin should receive read status update
        admin_ws.send_text.assert_called()

    @pytest.mark.asyncio
    async def test_connection_status_broadcasting(self):
        """Test connection status broadcasting"""
        # Setup session with multiple connections
        customer_ws = AsyncMock()
        customer_ws.client_state.name = "CONNECTED"
        admin_ws = AsyncMock()
        admin_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
            user_name="Customer",
        )

        await self.manager.connect(
            websocket=admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            session_id="session_123",
            user_name="Admin",
        )

        # Reset mocks
        customer_ws.send_text.reset_mock()
        admin_ws.send_text.reset_mock()

        # Simulate user joining notification
        join_message = {
            "type": MessageType.USER_JOINED.value,
            "user_name": "New User",
            "session_id": "session_123",
        }

        await self.manager.broadcast_to_session("session_123", join_message)

        # Both connections should receive the notification
        customer_ws.send_text.assert_called()
        admin_ws.send_text.assert_called()

    @pytest.mark.asyncio
    async def test_product_specific_broadcasting(self):
        """Test broadcasting to all connections for a specific product"""
        # Setup connections for same product
        customer1_ws = AsyncMock()
        customer1_ws.client_state.name = "CONNECTED"
        customer2_ws = AsyncMock()
        customer2_ws.client_state.name = "CONNECTED"
        admin_ws = AsyncMock()
        admin_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=customer1_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_1",
            product_id=123,
        )

        await self.manager.connect(
            websocket=customer2_ws,
            connection_id="customer_2",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_2",
            product_id=123,
        )

        await self.manager.connect(
            websocket=admin_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            product_id=123,
        )

        # Reset mocks
        customer1_ws.send_text.reset_mock()
        customer2_ws.send_text.reset_mock()
        admin_ws.send_text.reset_mock()

        # Broadcast product update
        product_update = {
            "type": "product_update",
            "product_id": 123,
            "message": "Product information has been updated",
        }

        await self.manager.broadcast_to_product(123, product_update)

        # All connections for product 123 should receive the update
        customer1_ws.send_text.assert_called()
        customer2_ws.send_text.assert_called()
        admin_ws.send_text.assert_called()

    @pytest.mark.asyncio
    async def test_admin_notification_broadcasting(self):
        """Test broadcasting notifications to all admin connections"""
        # Setup multiple admin connections
        admin1_ws = AsyncMock()
        admin1_ws.client_state.name = "CONNECTED"
        admin2_ws = AsyncMock()
        admin2_ws.client_state.name = "CONNECTED"
        customer_ws = AsyncMock()
        customer_ws.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=admin1_ws,
            connection_id="admin_1",
            connection_type=ConnectionType.ADMIN,
            user_id=1,
        )

        await self.manager.connect(
            websocket=admin2_ws,
            connection_id="admin_2",
            connection_type=ConnectionType.ADMIN,
            user_id=2,
        )

        await self.manager.connect(
            websocket=customer_ws,
            connection_id="customer_1",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Reset mocks
        admin1_ws.send_text.reset_mock()
        admin2_ws.send_text.reset_mock()
        customer_ws.send_text.reset_mock()

        # Broadcast admin notification
        admin_notification = {
            "type": "admin_notification",
            "message": "New high priority inquiry received",
            "priority": "high",
        }

        await self.manager.broadcast_to_admins(admin_notification)

        # Only admin connections should receive the notification
        admin1_ws.send_text.assert_called()
        admin2_ws.send_text.assert_called()
        customer_ws.send_text.assert_not_called()


class TestWebSocketConnectionManagement:
    """Test WebSocket connection management features"""

    def setup_method(self):
        """Set up fresh WebSocketManager for each test"""
        self.manager = WebSocketManager()

    @pytest.mark.asyncio
    async def test_connection_heartbeat_monitoring(self):
        """Test connection heartbeat and activity monitoring"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        connection = await self.manager.connect(
            websocket=mock_websocket,
            connection_id="heartbeat_test",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Verify initial activity timestamp
        initial_activity = connection.last_activity

        # Simulate message sending (should update activity)
        await connection.send_message({"type": "test", "content": "ping"})

        # Activity should be updated
        assert connection.last_activity > initial_activity

    @pytest.mark.asyncio
    async def test_inactive_connection_cleanup(self):
        """Test cleanup of inactive connections"""
        # Create connection with disconnected state
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "DISCONNECTED"

        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="inactive_conn",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Verify connection exists
        assert "inactive_conn" in self.manager.connections

        # Run cleanup with zero timeout (should clean up immediately)
        await self.manager.cleanup_inactive_connections(timeout_minutes=0)

        # Connection should be cleaned up
        assert "inactive_conn" not in self.manager.connections

    @pytest.mark.asyncio
    async def test_connection_recovery_after_failure(self):
        """Test connection recovery mechanisms"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Initial connection
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="recovery_test",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Simulate connection failure
        mock_websocket.send_text.side_effect = Exception("Connection lost")

        # Try to send message (should fail and cleanup connection)
        result = await self.manager.send_to_connection(
            "recovery_test", {"type": "test", "content": "hello"}
        )

        assert result is False
        assert "recovery_test" not in self.manager.connections

    @pytest.mark.asyncio
    async def test_concurrent_connection_handling(self):
        """Test handling of multiple concurrent connections"""
        connections = []

        # Create multiple connections concurrently
        for i in range(10):
            mock_ws = AsyncMock()
            mock_ws.client_state.name = "CONNECTED"

            connection_task = self.manager.connect(
                websocket=mock_ws,
                connection_id=f"concurrent_{i}",
                connection_type=ConnectionType.CUSTOMER,
                session_id=f"session_{i}",
            )
            connections.append(connection_task)

        # Wait for all connections to complete
        await asyncio.gather(*connections)

        # Verify all connections are registered
        assert len(self.manager.connections) == 10

        # Test concurrent message sending
        message_tasks = []
        for i in range(10):
            task = self.manager.send_to_connection(
                f"concurrent_{i}", {"type": "test", "content": f"message_{i}"}
            )
            message_tasks.append(task)

        results = await asyncio.gather(*message_tasks)

        # All messages should be sent successfully
        assert all(results)

    def test_connection_statistics_accuracy(self):
        """Test accuracy of connection statistics"""
        # Initially empty
        stats = self.manager.get_connection_stats()
        assert stats["total_connections"] == 0
        assert stats["customer_connections"] == 0
        assert stats["admin_connections"] == 0

    @pytest.mark.asyncio
    async def test_session_info_accuracy(self):
        """Test accuracy of session information"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Create connection
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="session_info_test",
            connection_type=ConnectionType.CUSTOMER,
            session_id="test_session",
            user_name="Test User",
            product_id=123,
        )

        # Get session info
        session_info = self.manager.get_session_info("test_session")

        assert session_info is not None
        assert session_info["session_id"] == "test_session"
        assert session_info["connection_count"] == 1
        assert len(session_info["connections"]) == 1
        assert session_info["connections"][0]["user_name"] == "Test User"
        assert session_info["connections"][0]["product_id"] == 123


class TestWebSocketErrorHandling:
    """Test WebSocket error handling and resilience"""

    def setup_method(self):
        """Set up fresh WebSocketManager for each test"""
        self.manager = WebSocketManager()

    @pytest.mark.asyncio
    async def test_websocket_disconnect_handling(self):
        """Test handling of WebSocket disconnections"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        # Connect
        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="disconnect_test",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Simulate WebSocket disconnect
        mock_websocket.send_text.side_effect = WebSocketDisconnect()

        # Try to send message
        result = await self.manager.send_to_connection(
            "disconnect_test", {"type": "test"}
        )

        # Should return False and clean up connection
        assert result is False
        assert "disconnect_test" not in self.manager.connections

    @pytest.mark.asyncio
    async def test_malformed_message_handling(self):
        """Test handling of malformed messages"""
        mock_websocket = AsyncMock()
        mock_websocket.client_state.name = "CONNECTED"

        await self.manager.connect(
            websocket=mock_websocket,
            connection_id="malformed_test",
            connection_type=ConnectionType.CUSTOMER,
            session_id="session_123",
        )

        # Test various malformed messages
        malformed_messages = [
            None,  # None message
            "not a dict",  # String instead of dict
            {"no_type": "value"},  # Missing type field
            {"type": None},  # None type
        ]

        for message in malformed_messages:
            # Should handle gracefully without crashing
            try:
                await self.manager.handle_message("malformed_test", message)
            except Exception as e:
                # Should not raise unhandled exceptions
                pytest.fail(f"Unhandled exception for malformed message {message}: {e}")

    @pytest.mark.asyncio
    async def test_connection_limit_handling(self):
        """Test handling of connection limits"""
        # This would test connection limits if implemented
        # For now, we'll test that the system can handle many connections
        connections = []

        for i in range(100):  # Create many connections
            mock_ws = AsyncMock()
            mock_ws.client_state.name = "CONNECTED"

            try:
                await self.manager.connect(
                    websocket=mock_ws,
                    connection_id=f"limit_test_{i}",
                    connection_type=ConnectionType.CUSTOMER,
                    session_id=f"session_{i}",
                )
                connections.append(f"limit_test_{i}")
            except Exception as e:
                # If there are connection limits, they should be handled gracefully
                break

        # System should handle the connections without crashing
        assert len(self.manager.connections) > 0

    @pytest.mark.asyncio
    async def test_memory_leak_prevention(self):
        """Test prevention of memory leaks in connection management"""
        # Create and destroy many connections
        for i in range(50):
            mock_ws = AsyncMock()
            mock_ws.client_state.name = "CONNECTED"

            connection_id = f"memory_test_{i}"

            # Connect
            await self.manager.connect(
                websocket=mock_ws,
                connection_id=connection_id,
                connection_type=ConnectionType.CUSTOMER,
                session_id=f"session_{i}",
            )

            # Immediately disconnect
            await self.manager.disconnect(connection_id)

        # All connections should be cleaned up
        assert len(self.manager.connections) == 0
        assert len(self.manager.session_connections) == 0
        assert len(self.manager.product_connections) == 0


class TestWebSocketIntegrationWithAPI:
    """Test WebSocket integration with API endpoints"""

    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    def test_websocket_endpoint_availability(self):
        """Test that WebSocket endpoints are available"""
        # Check that WebSocket routes exist
        websocket_routes = [
            route
            for route in app.routes
            if hasattr(route, "path") and "/ws/" in route.path
        ]

        assert len(websocket_routes) > 0, "WebSocket endpoints should be available"

    @patch("main.websocket_manager")
    def test_websocket_customer_endpoint_integration(self, mock_manager):
        """Test customer WebSocket endpoint integration"""
        mock_manager.connect = AsyncMock()
        mock_manager.disconnect = AsyncMock()
        mock_manager.handle_message = AsyncMock()

        # Test WebSocket connection
        with self.client.websocket_connect(
            "/ws/chat/customer/123/test_session?customer_name=TestUser"
        ) as websocket:
            # Should be able to connect
            assert websocket is not None

            # Send test message
            test_message = {
                "type": "chat_message",
                "message": "Hello, I need help",
            }
            websocket.send_text(json.dumps(test_message))

    @patch("main.websocket_manager")
    def test_websocket_admin_endpoint_integration(self, mock_manager):
        """Test admin WebSocket endpoint integration"""
        mock_manager.connect = AsyncMock()
        mock_manager.disconnect = AsyncMock()
        mock_manager.handle_message = AsyncMock()

        # Test admin WebSocket connection
        with self.client.websocket_connect(
            "/ws/chat/admin/1?admin_name=AdminUser"
        ) as websocket:
            # Should be able to connect
            assert websocket is not None

            # Send admin message
            admin_message = {
                "type": "chat_message",
                "message": "How can I help you?",
            }
            websocket.send_text(json.dumps(admin_message))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
