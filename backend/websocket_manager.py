"""
WebSocket Manager for Real-time Chat Functionality

This module handles WebSocket connections for real-time messaging between
customers and admins in the product chat system.
"""

import json
import logging
from typing import Dict, List, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import asyncio
from enum import Enum

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConnectionType(Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class MessageType(Enum):
    CHAT_MESSAGE = "chat_message"
    TYPING_INDICATOR = "typing_indicator"
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    MESSAGE_READ = "message_read"
    CONNECTION_STATUS = "connection_status"
    ERROR = "error"


class WebSocketConnection:
    """Represents a single WebSocket connection"""

    def __init__(
        self,
        websocket: WebSocket,
        connection_id: str,
        connection_type: ConnectionType,
        session_id: str = None,
        product_id: int = None,
        user_id: int = None,
        user_name: str = None,
    ):
        self.websocket = websocket
        self.connection_id = connection_id
        self.connection_type = connection_type
        self.session_id = session_id
        self.product_id = product_id
        self.user_id = user_id
        self.user_name = user_name
        self.connected_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.is_typing = False

    async def send_message(self, message: dict):
        """Send a message through this WebSocket connection with enhanced error handling"""
        try:
            # Validate message structure
            if not isinstance(message, dict):
                logger.error(
                    f"Invalid message type for {self.connection_id}: {type(message)}"
                )
                return False

            # Add message validation
            if "type" not in message:
                logger.error(f"Message missing 'type' field for {self.connection_id}")
                return False

            # Serialize message with error handling
            try:
                message_str = json.dumps(message, default=str)
            except (TypeError, ValueError) as e:
                logger.error(
                    f"Failed to serialize message for {self.connection_id}: {e}"
                )
                return False

            # Check connection state before sending
            if not self.is_connected():
                logger.debug(
                    f"Connection {self.connection_id} not active, cannot send message"
                )
                return False

            await self.websocket.send_text(message_str)
            self.last_activity = datetime.utcnow()
            return True

        except Exception as e:
            # Categorize different error types
            error_type = type(e).__name__
            error_message = str(e)

            # More specific error handling
            if "ConnectionClosed" in error_type or "WebSocketDisconnect" in error_type:
                logger.debug(f"Connection {self.connection_id} already closed: {e}")
            elif "ConnectionResetError" in error_type:
                logger.warning(f"Connection reset for {self.connection_id}: {e}")
            elif "TimeoutError" in error_type:
                logger.warning(f"Timeout sending message to {self.connection_id}: {e}")
            elif "RuntimeError" in error_type and "WebSocket" in error_message:
                logger.debug(f"WebSocket runtime error for {self.connection_id}: {e}")
            elif (
                "InvalidState" in error_type or "invalid state" in error_message.lower()
            ):
                logger.debug(f"WebSocket invalid state for {self.connection_id}: {e}")
            elif (
                "BrokenPipeError" in error_type
                or "broken pipe" in error_message.lower()
            ):
                logger.debug(f"Broken pipe for {self.connection_id}: {e}")
            elif hasattr(e, "code") and hasattr(e, "reason"):
                # WebSocket close codes
                logger.debug(
                    f"WebSocket closed with code {e.code} for {self.connection_id}: {e.reason}"
                )
            else:
                # Only log as error if it's truly unexpected
                logger.warning(
                    f"WebSocket send error for {self.connection_id} (type: {error_type}): {e}"
                )

            return False

    def is_connected(self):
        """Check if the WebSocket connection is still active"""
        try:
            # Check if websocket exists and has client_state
            if not hasattr(self.websocket, "client_state"):
                return False

            # Check the connection state
            state = self.websocket.client_state.name
            return state == "CONNECTED"
        except AttributeError:
            # client_state might not exist
            return False
        except Exception as e:
            logger.debug(
                f"Error checking connection state for {self.connection_id}: {e}"
            )
            return False

    def to_dict(self):
        """Convert connection to dictionary for serialization"""
        return {
            "connection_id": self.connection_id,
            "connection_type": self.connection_type.value,
            "session_id": self.session_id,
            "product_id": self.product_id,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "connected_at": self.connected_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "is_typing": self.is_typing,
        }


class WebSocketManager:
    """Manages all WebSocket connections for the chat system"""

    def __init__(self):
        # All active connections by connection_id
        self.connections: Dict[str, WebSocketConnection] = {}

        # Connections grouped by session_id for easy broadcasting
        self.session_connections: Dict[str, Set[str]] = {}

        # Admin connections for broadcasting to all admins
        self.admin_connections: Set[str] = set()

        # Product-specific connections for targeted messaging
        self.product_connections: Dict[int, Set[str]] = {}

        # Typing indicators by session
        self.typing_users: Dict[str, Set[str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        connection_id: str,
        connection_type: ConnectionType,
        session_id: str = None,
        product_id: int = None,
        user_id: int = None,
        user_name: str = None,
        ip_address: str = None,
    ) -> WebSocketConnection:
        """Accept a new WebSocket connection with connection pool integration"""

        # Accept WebSocket first, then check limits
        await websocket.accept()

        # Check connection pool limits if available (after accepting)
        try:
            from utils.connection_pool import connection_pool

            can_accept, reason = connection_pool.can_accept_connection(
                ip_address or "unknown"
            )
            if not can_accept:
                logger.warning(
                    f"Connection pool limit reached for {ip_address}: {reason}"
                )
                # Send a proper error message before closing
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "message": f"Connection limit reached: {reason}",
                            "code": "CONNECTION_LIMIT_EXCEEDED",
                        }
                    )
                )
                await websocket.close(code=1008, reason=reason)
                raise Exception(f"Connection rejected: {reason}")
        except ImportError:
            pass  # Connection pool not available
        except Exception as e:
            if "Connection rejected" not in str(e):
                logger.warning(f"Connection pool check failed: {e}")
                # Continue with connection if pool check fails

        connection = WebSocketConnection(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=connection_type,
            session_id=session_id,
            product_id=product_id,
            user_id=user_id,
            user_name=user_name,
        )

        # Store the connection
        self.connections[connection_id] = connection

        # Register with connection pool if available
        try:
            from utils.connection_pool import connection_pool

            connection_pool.register_connection(
                connection_id=connection_id,
                connection_obj=connection,
                ip_address=ip_address or "unknown",
                connection_type=connection_type.value,
                session_id=session_id,
                product_id=product_id,
            )
        except ImportError:
            pass

        # Group by session if applicable
        if session_id:
            if session_id not in self.session_connections:
                self.session_connections[session_id] = set()
            self.session_connections[session_id].add(connection_id)

        # Group admin connections
        if connection_type == ConnectionType.ADMIN:
            self.admin_connections.add(connection_id)

        # Group by product if applicable
        if product_id:
            if product_id not in self.product_connections:
                self.product_connections[product_id] = set()
            self.product_connections[product_id].add(connection_id)

        logger.info(f"New {connection_type.value} connection: {connection_id}")

        # Notify about new connection
        await self._broadcast_user_joined(connection)

        # Send connection confirmation
        await connection.send_message(
            {
                "type": MessageType.CONNECTION_STATUS.value,
                "status": "connected",
                "connection_id": connection_id,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        return connection

    async def disconnect(self, connection_id: str):
        """Handle WebSocket disconnection with connection pool integration"""

        if connection_id not in self.connections:
            return

        connection = self.connections[connection_id]

        # Unregister from connection pool if available
        try:
            from utils.connection_pool import connection_pool

            await connection_pool.unregister_connection(connection_id)
        except ImportError:
            pass

        # Remove from all tracking structures
        del self.connections[connection_id]

        if connection.session_id and connection.session_id in self.session_connections:
            self.session_connections[connection.session_id].discard(connection_id)
            if not self.session_connections[connection.session_id]:
                del self.session_connections[connection.session_id]

        if connection.connection_type == ConnectionType.ADMIN:
            self.admin_connections.discard(connection_id)

        if connection.product_id and connection.product_id in self.product_connections:
            self.product_connections[connection.product_id].discard(connection_id)
            if not self.product_connections[connection.product_id]:
                del self.product_connections[connection.product_id]

        # Remove from typing indicators
        if connection.session_id and connection.session_id in self.typing_users:
            self.typing_users[connection.session_id].discard(connection_id)
            if not self.typing_users[connection.session_id]:
                del self.typing_users[connection.session_id]

        logger.info(f"Disconnected: {connection_id}")

        # Notify about disconnection
        await self._broadcast_user_left(connection)

    async def send_to_connection(self, connection_id: str, message: dict):
        """Send a message to a specific connection with enhanced error handling"""

        if connection_id not in self.connections:
            logger.debug(f"Connection {connection_id} not found")
            return False

        connection = self.connections[connection_id]

        # Check if connection is still active before sending
        if not connection.is_connected():
            logger.debug(f"Connection {connection_id} is no longer active, cleaning up")
            await self.disconnect(connection_id)
            return False

        # Calculate message size for metrics
        message_size = len(str(message).encode("utf-8"))

        # Attempt to send message with retry logic
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                success = await connection.send_message(message)
                if success:
                    # Update connection pool metrics if available
                    try:
                        from utils.connection_pool import connection_pool

                        connection_pool.update_connection_activity(
                            connection_id=connection_id,
                            message_count=1,
                            bytes_sent=message_size,
                        )
                    except ImportError:
                        pass

                    return True

                # If send_message returned False, connection might be stale
                if attempt < max_retries:
                    # Check if connection is still valid before retrying
                    if not connection.is_connected():
                        logger.debug(
                            f"Connection {connection_id} no longer active, stopping retries"
                        )
                        await self.disconnect(connection_id)
                        return False

                    logger.debug(
                        f"Retrying send to {connection_id} (attempt {attempt + 1})"
                    )
                    await asyncio.sleep(0.1)  # Brief delay before retry
                    continue
                else:
                    logger.debug(
                        f"Failed to send message to {connection_id} after {max_retries + 1} attempts - disconnecting"
                    )
                    # Report error to connection pool
                    try:
                        from utils.connection_pool import connection_pool

                        connection_pool.update_connection_activity(
                            connection_id=connection_id, error_occurred=True
                        )
                    except ImportError:
                        pass

                    await self.disconnect(connection_id)
                    return False

            except Exception as e:
                error_type = type(e).__name__
                error_message = str(e)

                # Handle common WebSocket errors gracefully
                if (
                    "ConnectionClosed" in error_type
                    or "WebSocketDisconnect" in error_type
                    or "RuntimeError" in error_type
                    and "WebSocket" in error_message
                    or "InvalidState" in error_type
                    or "BrokenPipeError" in error_type
                ):
                    logger.debug(
                        f"Connection {connection_id} disconnected during send: {error_type}"
                    )
                    await self.disconnect(connection_id)
                    return False
                elif attempt < max_retries:
                    # Only retry for potentially recoverable errors
                    if not connection.is_connected():
                        logger.debug(
                            f"Connection {connection_id} no longer active during retry"
                        )
                        await self.disconnect(connection_id)
                        return False

                    logger.debug(
                        f"Retrying send to {connection_id} (attempt {attempt + 1}) after {error_type}: {e}"
                    )
                    await asyncio.sleep(0.1)  # Brief delay before retry
                    continue
                else:
                    logger.warning(
                        f"Failed to send to {connection_id} after {max_retries + 1} attempts ({error_type}): {e}"
                    )
                    # Report error to connection pool
                    try:
                        from utils.connection_pool import connection_pool

                        connection_pool.update_connection_activity(
                            connection_id=connection_id, error_occurred=True
                        )
                    except ImportError:
                        pass

                    await self.disconnect(connection_id)
                    return False

        return False

    async def broadcast_to_session(
        self, session_id: str, message: dict, exclude_connection: str = None
    ):
        """Broadcast a message to all connections in a session"""

        if session_id not in self.session_connections:
            return

        connections_to_remove = []

        # Create a copy of the set to avoid "Set changed size during iteration" error
        connection_ids = list(self.session_connections[session_id])

        for connection_id in connection_ids:
            if exclude_connection and connection_id == exclude_connection:
                continue

            success = await self.send_to_connection(connection_id, message)
            if not success:
                connections_to_remove.append(connection_id)

        # Clean up failed connections
        for connection_id in connections_to_remove:
            await self.disconnect(connection_id)

    async def broadcast_to_admins(self, message: dict, exclude_connection: str = None):
        """Broadcast a message to all admin connections"""

        connections_to_remove = []

        for connection_id in self.admin_connections.copy():
            if exclude_connection and connection_id == exclude_connection:
                continue

            success = await self.send_to_connection(connection_id, message)
            if not success:
                connections_to_remove.append(connection_id)

        # Clean up failed connections
        for connection_id in connections_to_remove:
            await self.disconnect(connection_id)

    async def broadcast_to_product(
        self, product_id: int, message: dict, exclude_connection: str = None
    ):
        """Broadcast a message to all connections for a specific product"""

        if product_id not in self.product_connections:
            return

        connections_to_remove = []

        for connection_id in self.product_connections[product_id].copy():
            if exclude_connection and connection_id == exclude_connection:
                continue

            success = await self.send_to_connection(connection_id, message)
            if not success:
                connections_to_remove.append(connection_id)

        # Clean up failed connections
        for connection_id in connections_to_remove:
            await self.disconnect(connection_id)

    async def handle_message(self, connection_id: str, message_data: dict):
        """Handle incoming WebSocket message"""

        if connection_id not in self.connections:
            return

        connection = self.connections[connection_id]
        connection.last_activity = datetime.utcnow()

        message_type = message_data.get("type")

        if message_type == MessageType.CHAT_MESSAGE.value:
            await self._handle_chat_message(connection, message_data)
        elif message_type == MessageType.TYPING_INDICATOR.value:
            await self._handle_typing_indicator(connection, message_data)
        elif message_type == MessageType.MESSAGE_READ.value:
            await self._handle_message_read(connection, message_data)
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def _handle_chat_message(
        self, connection: WebSocketConnection, message_data: dict
    ):
        """Handle chat message and broadcast to session"""

        if not connection.session_id:
            return

        # Add sender information
        message_data.update(
            {
                "sender_id": connection.user_id,
                "sender_name": connection.user_name,
                "sender_type": connection.connection_type.value,
                "timestamp": datetime.utcnow().isoformat(),
                "connection_id": connection.connection_id,
            }
        )

        # Broadcast to all connections in the session
        await self.broadcast_to_session(
            connection.session_id,
            message_data,
            exclude_connection=connection.connection_id,
        )

        # If customer message, also notify admins
        if connection.connection_type == ConnectionType.CUSTOMER:
            admin_notification = {
                "type": "new_customer_message",
                "session_id": connection.session_id,
                "product_id": connection.product_id,
                "customer_name": connection.user_name,
                "message": message_data.get("message", ""),
                "timestamp": datetime.utcnow().isoformat(),
            }
            await self.broadcast_to_admins(admin_notification)

    async def _handle_typing_indicator(
        self, connection: WebSocketConnection, message_data: dict
    ):
        """Handle typing indicator"""

        if not connection.session_id:
            return

        is_typing = message_data.get("is_typing", False)
        connection.is_typing = is_typing

        # Update typing users for this session
        if connection.session_id not in self.typing_users:
            self.typing_users[connection.session_id] = set()

        if is_typing:
            self.typing_users[connection.session_id].add(connection.connection_id)
        else:
            self.typing_users[connection.session_id].discard(connection.connection_id)

        # Broadcast typing indicator to session
        typing_message = {
            "type": MessageType.TYPING_INDICATOR.value,
            "session_id": connection.session_id,
            "user_name": connection.user_name,
            "user_type": connection.connection_type.value,
            "is_typing": is_typing,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self.broadcast_to_session(
            connection.session_id,
            typing_message,
            exclude_connection=connection.connection_id,
        )

    async def _handle_message_read(
        self, connection: WebSocketConnection, message_data: dict
    ):
        """Handle message read status"""

        if not connection.session_id:
            return

        read_message = {
            "type": MessageType.MESSAGE_READ.value,
            "session_id": connection.session_id,
            "message_ids": message_data.get("message_ids", []),
            "read_by": connection.user_name,
            "read_by_type": connection.connection_type.value,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self.broadcast_to_session(
            connection.session_id,
            read_message,
            exclude_connection=connection.connection_id,
        )

    async def _broadcast_user_joined(self, connection: WebSocketConnection):
        """Broadcast user joined notification"""

        if not connection.session_id:
            return

        join_message = {
            "type": MessageType.USER_JOINED.value,
            "session_id": connection.session_id,
            "user_name": connection.user_name,
            "user_type": connection.connection_type.value,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self.broadcast_to_session(
            connection.session_id,
            join_message,
            exclude_connection=connection.connection_id,
        )

    async def _broadcast_user_left(self, connection: WebSocketConnection):
        """Broadcast user left notification"""

        if not connection.session_id:
            return

        leave_message = {
            "type": MessageType.USER_LEFT.value,
            "session_id": connection.session_id,
            "user_name": connection.user_name,
            "user_type": connection.connection_type.value,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self.broadcast_to_session(connection.session_id, leave_message)

    async def cleanup_inactive_connections(self, timeout_minutes: int = 30):
        """Clean up inactive connections"""

        cutoff_time = datetime.utcnow().timestamp() - (timeout_minutes * 60)
        inactive_connections = []

        for connection_id, connection in self.connections.items():
            # Check if connection is inactive by time
            if connection.last_activity.timestamp() < cutoff_time:
                inactive_connections.append(connection_id)
            # Also check if WebSocket is disconnected
            elif not connection.is_connected():
                inactive_connections.append(connection_id)

        for connection_id in inactive_connections:
            logger.info(f"Cleaning up inactive connection: {connection_id}")
            await self.disconnect(connection_id)

    async def cleanup_stale_connections(self):
        """Clean up connections that are no longer valid"""
        stale_connections = []

        for connection_id, connection in list(self.connections.items()):
            try:
                # Check if the connection is still valid
                if not connection.is_connected():
                    stale_connections.append(connection_id)
            except Exception as e:
                logger.debug(f"Error checking connection {connection_id}: {e}")
                stale_connections.append(connection_id)

        for connection_id in stale_connections:
            logger.debug(f"Cleaning up stale connection: {connection_id}")
            await self.disconnect(connection_id)

        return len(stale_connections)

    def get_connection_stats(self):
        """Get statistics about current connections"""

        total_connections = len(self.connections)
        customer_connections = sum(
            1
            for conn in self.connections.values()
            if conn.connection_type == ConnectionType.CUSTOMER
        )
        admin_connections = len(self.admin_connections)
        active_sessions = len(self.session_connections)

        return {
            "total_connections": total_connections,
            "customer_connections": customer_connections,
            "admin_connections": admin_connections,
            "active_sessions": active_sessions,
            "connections_by_product": {
                product_id: len(connections)
                for product_id, connections in self.product_connections.items()
            },
        }

    def get_session_info(self, session_id: str):
        """Get information about a specific session"""

        if session_id not in self.session_connections:
            return None

        connections = []
        for connection_id in list(self.session_connections[session_id]):
            if connection_id in self.connections:
                connections.append(self.connections[connection_id].to_dict())

        typing_users = []
        if session_id in self.typing_users:
            for connection_id in list(self.typing_users[session_id]):
                if connection_id in self.connections:
                    conn = self.connections[connection_id]
                    typing_users.append(
                        {
                            "user_name": conn.user_name,
                            "user_type": conn.connection_type.value,
                        }
                    )

        return {
            "session_id": session_id,
            "connections": connections,
            "typing_users": typing_users,
            "connection_count": len(connections),
        }


# Global WebSocket manager instance
websocket_manager = WebSocketManager()


# Background task for cleanup
async def cleanup_task():
    """Background task to clean up inactive and stale connections"""
    while True:
        try:
            # Clean up stale connections more frequently
            stale_count = await websocket_manager.cleanup_stale_connections()
            if stale_count > 0:
                logger.info(f"Cleaned up {stale_count} stale connections")

            # Clean up inactive connections less frequently
            await websocket_manager.cleanup_inactive_connections()
            await asyncio.sleep(30)  # Run every 30 seconds
        except Exception as e:
            logger.error(f"Error in WebSocket cleanup task: {e}")
            await asyncio.sleep(30)  # Wait 30 seconds before retrying
