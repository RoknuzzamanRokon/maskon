"""
Connection pool manager for WebSocket connections
Provides efficient connection management and resource optimization
"""

import asyncio
import logging
import time
from typing import Dict, Set, Optional, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
import weakref
import gc

logger = logging.getLogger(__name__)


class PoolStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    OVERLOADED = "overloaded"
    CRITICAL = "critical"


@dataclass
class ConnectionMetrics:
    """Metrics for a connection"""

    created_at: datetime
    last_activity: datetime
    message_count: int
    bytes_sent: int
    bytes_received: int
    error_count: int

    def to_dict(self) -> Dict:
        return {
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "message_count": self.message_count,
            "bytes_sent": self.bytes_sent,
            "bytes_received": self.bytes_received,
            "error_count": self.error_count,
            "age_seconds": (datetime.utcnow() - self.created_at).total_seconds(),
            "idle_seconds": (datetime.utcnow() - self.last_activity).total_seconds(),
        }


@dataclass
class PoolMetrics:
    """Metrics for the connection pool"""

    total_connections: int
    active_connections: int
    idle_connections: int
    customer_connections: int
    admin_connections: int
    connections_per_product: Dict[int, int]
    connections_per_session: Dict[str, int]
    average_connection_age: float
    memory_usage_mb: float
    status: PoolStatus

    def to_dict(self) -> Dict:
        return {
            "total_connections": self.total_connections,
            "active_connections": self.active_connections,
            "idle_connections": self.idle_connections,
            "customer_connections": self.customer_connections,
            "admin_connections": self.admin_connections,
            "connections_per_product": self.connections_per_product,
            "connections_per_session": self.connections_per_session,
            "average_connection_age": self.average_connection_age,
            "memory_usage_mb": self.memory_usage_mb,
            "status": self.status.value,
        }


class ConnectionPool:
    """Advanced connection pool for WebSocket management"""

    def __init__(
        self,
        max_connections: int = 1000,
        max_connections_per_ip: int = 25,  # Increased from 10 to 25
        max_idle_time: int = 1800,  # 30 minutes
        cleanup_interval: int = 300,  # 5 minutes
        health_check_interval: int = 60,  # 1 minute
    ):
        self.max_connections = max_connections
        self.max_connections_per_ip = max_connections_per_ip
        self.max_idle_time = max_idle_time
        self.cleanup_interval = cleanup_interval
        self.health_check_interval = health_check_interval

        # Connection tracking
        self.connections: Dict[str, weakref.ref] = {}
        self.connection_metrics: Dict[str, ConnectionMetrics] = {}

        # IP-based connection tracking
        self.connections_by_ip: Dict[str, Set[str]] = defaultdict(set)

        # Session and product grouping
        self.connections_by_session: Dict[str, Set[str]] = defaultdict(set)
        self.connections_by_product: Dict[int, Set[str]] = defaultdict(set)

        # Connection type tracking
        self.customer_connections: Set[str] = set()
        self.admin_connections: Set[str] = set()

        # Pool status and metrics
        self.pool_status = PoolStatus.HEALTHY
        self.last_cleanup = time.time()
        self.last_health_check = time.time()

        # Performance tracking
        self.total_connections_created = 0
        self.total_connections_closed = 0
        self.total_messages_processed = 0
        self.total_bytes_transferred = 0

        # Resource limits
        self.memory_warning_threshold = 100  # MB
        self.memory_critical_threshold = 200  # MB

        # Background tasks
        self._cleanup_task = None
        self._health_check_task = None
        self._start_background_tasks()

    def _start_background_tasks(self):
        """Start background maintenance tasks"""
        try:
            # Only start tasks if there's a running event loop
            loop = asyncio.get_running_loop()

            if self._cleanup_task is None or self._cleanup_task.done():
                self._cleanup_task = asyncio.create_task(self._cleanup_loop())

            if self._health_check_task is None or self._health_check_task.done():
                self._health_check_task = asyncio.create_task(self._health_check_loop())
        except RuntimeError:
            # No running event loop, tasks will be started when needed
            pass

    async def _cleanup_loop(self):
        """Background cleanup task"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                await self.cleanup_stale_connections()
                self._cleanup_metrics()
                gc.collect()  # Force garbage collection
            except Exception as e:
                logger.error(f"Error in connection pool cleanup: {e}")

    async def _health_check_loop(self):
        """Background health check task"""
        while True:
            try:
                await asyncio.sleep(self.health_check_interval)
                await self._perform_health_check()
            except Exception as e:
                logger.error(f"Error in connection pool health check: {e}")

    def can_accept_connection(self, ip_address: str) -> Tuple[bool, Optional[str]]:
        """Check if a new connection can be accepted"""
        # Check total connection limit
        active_connections = len(
            [ref for ref in self.connections.values() if ref() is not None]
        )

        if active_connections >= self.max_connections:
            return False, f"Maximum connections ({self.max_connections}) reached"

        # Check per-IP limit
        ip_connections = len(self.connections_by_ip.get(ip_address, set()))
        if ip_connections >= self.max_connections_per_ip:
            return (
                False,
                f"Maximum connections per IP ({self.max_connections_per_ip}) reached",
            )

        # Check pool status
        if self.pool_status == PoolStatus.CRITICAL:
            return False, "Connection pool is in critical state"

        return True, None

    def register_connection(
        self,
        connection_id: str,
        connection_obj,
        ip_address: str,
        connection_type: str,
        session_id: str = None,
        product_id: int = None,
    ):
        """Register a new connection in the pool"""
        # Create weak reference to avoid circular references
        self.connections[connection_id] = weakref.ref(
            connection_obj, lambda ref: self._connection_cleanup_callback(connection_id)
        )

        # Initialize metrics
        self.connection_metrics[connection_id] = ConnectionMetrics(
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            message_count=0,
            bytes_sent=0,
            bytes_received=0,
            error_count=0,
        )

        # Track by IP
        self.connections_by_ip[ip_address].add(connection_id)

        # Track by session
        if session_id:
            self.connections_by_session[session_id].add(connection_id)

        # Track by product
        if product_id:
            self.connections_by_product[product_id].add(connection_id)

        # Track by type
        if connection_type == "customer":
            self.customer_connections.add(connection_id)
        elif connection_type == "admin":
            self.admin_connections.add(connection_id)

        self.total_connections_created += 1

        logger.debug(f"Registered connection {connection_id} from {ip_address}")

    def _connection_cleanup_callback(self, connection_id: str):
        """Callback when connection is garbage collected"""
        asyncio.create_task(self.unregister_connection(connection_id))

    async def unregister_connection(self, connection_id: str):
        """Unregister a connection from the pool"""
        if connection_id not in self.connections:
            return

        # Remove from main tracking
        del self.connections[connection_id]

        # Remove from IP tracking
        for ip_connections in self.connections_by_ip.values():
            ip_connections.discard(connection_id)

        # Remove from session tracking
        for session_connections in self.connections_by_session.values():
            session_connections.discard(connection_id)

        # Remove from product tracking
        for product_connections in self.connections_by_product.values():
            product_connections.discard(connection_id)

        # Remove from type tracking
        self.customer_connections.discard(connection_id)
        self.admin_connections.discard(connection_id)

        # Clean up metrics
        if connection_id in self.connection_metrics:
            del self.connection_metrics[connection_id]

        self.total_connections_closed += 1

        logger.debug(f"Unregistered connection {connection_id}")

    def update_connection_activity(
        self,
        connection_id: str,
        message_count: int = 0,
        bytes_sent: int = 0,
        bytes_received: int = 0,
        error_occurred: bool = False,
    ):
        """Update connection activity metrics"""
        if connection_id not in self.connection_metrics:
            return

        metrics = self.connection_metrics[connection_id]
        metrics.last_activity = datetime.utcnow()
        metrics.message_count += message_count
        metrics.bytes_sent += bytes_sent
        metrics.bytes_received += bytes_received

        if error_occurred:
            metrics.error_count += 1

        # Update global metrics
        self.total_messages_processed += message_count
        self.total_bytes_transferred += bytes_sent + bytes_received

    async def cleanup_stale_connections(self):
        """Clean up stale and inactive connections"""
        now = datetime.utcnow()
        cutoff_time = now - timedelta(seconds=self.max_idle_time)

        stale_connections = []

        for connection_id, metrics in self.connection_metrics.items():
            if metrics.last_activity < cutoff_time:
                stale_connections.append(connection_id)

        for connection_id in stale_connections:
            connection_ref = self.connections.get(connection_id)
            if connection_ref:
                connection = connection_ref()
                if connection:
                    try:
                        # Try to close the connection gracefully
                        if hasattr(connection, "close"):
                            await connection.close()
                        elif hasattr(connection, "websocket") and hasattr(
                            connection.websocket, "close"
                        ):
                            await connection.websocket.close()
                    except Exception as e:
                        logger.debug(
                            f"Error closing stale connection {connection_id}: {e}"
                        )

            await self.unregister_connection(connection_id)

        if stale_connections:
            logger.info(f"Cleaned up {len(stale_connections)} stale connections")

    def _cleanup_metrics(self):
        """Clean up orphaned metrics and empty collections"""
        # Clean up empty IP collections
        empty_ips = [
            ip for ip, connections in self.connections_by_ip.items() if not connections
        ]
        for ip in empty_ips:
            del self.connections_by_ip[ip]

        # Clean up empty session collections
        empty_sessions = [
            session
            for session, connections in self.connections_by_session.items()
            if not connections
        ]
        for session in empty_sessions:
            del self.connections_by_session[session]

        # Clean up empty product collections
        empty_products = [
            product
            for product, connections in self.connections_by_product.items()
            if not connections
        ]
        for product in empty_products:
            del self.connections_by_product[product]

    async def _perform_health_check(self):
        """Perform health check and update pool status"""
        active_connections = len(
            [ref for ref in self.connections.values() if ref() is not None]
        )
        memory_usage = self._estimate_memory_usage()

        # Determine pool status
        if (
            memory_usage > self.memory_critical_threshold
            or active_connections > self.max_connections * 0.95
        ):
            self.pool_status = PoolStatus.CRITICAL
        elif (
            memory_usage > self.memory_warning_threshold
            or active_connections > self.max_connections * 0.8
        ):
            self.pool_status = PoolStatus.OVERLOADED
        elif active_connections > self.max_connections * 0.6:
            self.pool_status = PoolStatus.DEGRADED
        else:
            self.pool_status = PoolStatus.HEALTHY

        # Log warnings if needed
        if self.pool_status != PoolStatus.HEALTHY:
            logger.warning(
                f"Connection pool status: {self.pool_status.value} "
                f"(connections: {active_connections}/{self.max_connections}, "
                f"memory: {memory_usage:.1f}MB)"
            )

    def _estimate_memory_usage(self) -> float:
        """Estimate memory usage of the connection pool"""
        # Rough estimation based on number of connections and data structures
        base_memory = 0.1  # Base overhead in MB

        connection_memory = len(self.connections) * 0.01  # ~10KB per connection
        metrics_memory = len(self.connection_metrics) * 0.005  # ~5KB per metrics object

        # Additional memory for tracking structures
        tracking_memory = (
            len(self.connections_by_ip) * 0.001
            + len(self.connections_by_session) * 0.001
            + len(self.connections_by_product) * 0.001
        )

        return base_memory + connection_memory + metrics_memory + tracking_memory

    def get_metrics(self) -> PoolMetrics:
        """Get comprehensive pool metrics"""
        now = datetime.utcnow()

        # Count active connections
        active_connections = 0
        total_age = 0

        for connection_id, ref in self.connections.items():
            if ref() is not None:
                active_connections += 1
                if connection_id in self.connection_metrics:
                    age = (
                        now - self.connection_metrics[connection_id].created_at
                    ).total_seconds()
                    total_age += age

        average_age = total_age / active_connections if active_connections > 0 else 0

        # Count idle connections
        idle_connections = 0
        idle_threshold = now - timedelta(minutes=5)

        for metrics in self.connection_metrics.values():
            if metrics.last_activity < idle_threshold:
                idle_connections += 1

        # Count connections per product
        connections_per_product = {}
        for product_id, connections in self.connections_by_product.items():
            active_count = sum(
                1
                for conn_id in connections
                if self.connections.get(conn_id, lambda: None)() is not None
            )
            if active_count > 0:
                connections_per_product[product_id] = active_count

        # Count connections per session
        connections_per_session = {}
        for session_id, connections in self.connections_by_session.items():
            active_count = sum(
                1
                for conn_id in connections
                if self.connections.get(conn_id, lambda: None)() is not None
            )
            if active_count > 0:
                connections_per_session[session_id] = active_count

        return PoolMetrics(
            total_connections=len(self.connections),
            active_connections=active_connections,
            idle_connections=idle_connections,
            customer_connections=len(
                [
                    conn_id
                    for conn_id in self.customer_connections
                    if self.connections.get(conn_id, lambda: None)() is not None
                ]
            ),
            admin_connections=len(
                [
                    conn_id
                    for conn_id in self.admin_connections
                    if self.connections.get(conn_id, lambda: None)() is not None
                ]
            ),
            connections_per_product=connections_per_product,
            connections_per_session=connections_per_session,
            average_connection_age=average_age,
            memory_usage_mb=self._estimate_memory_usage(),
            status=self.pool_status,
        )

    def get_connection_details(self, connection_id: str) -> Optional[Dict]:
        """Get detailed information about a specific connection"""
        if connection_id not in self.connections:
            return None

        connection_ref = self.connections[connection_id]
        connection = connection_ref()

        if connection is None:
            return None

        metrics = self.connection_metrics.get(connection_id)
        if not metrics:
            return None

        return {
            "connection_id": connection_id,
            "is_active": connection is not None,
            "metrics": metrics.to_dict(),
            "connection_type": (
                "admin" if connection_id in self.admin_connections else "customer"
            ),
            "session_id": getattr(connection, "session_id", None),
            "product_id": getattr(connection, "product_id", None),
            "user_name": getattr(connection, "user_name", None),
        }

    async def force_cleanup(self):
        """Force immediate cleanup of all resources"""
        logger.info("Performing force cleanup of connection pool")

        # Close all connections
        for connection_id, ref in list(self.connections.items()):
            connection = ref()
            if connection:
                try:
                    if hasattr(connection, "close"):
                        await connection.close()
                    elif hasattr(connection, "websocket") and hasattr(
                        connection.websocket, "close"
                    ):
                        await connection.websocket.close()
                except Exception as e:
                    logger.debug(f"Error closing connection {connection_id}: {e}")

        # Clear all tracking structures
        self.connections.clear()
        self.connection_metrics.clear()
        self.connections_by_ip.clear()
        self.connections_by_session.clear()
        self.connections_by_product.clear()
        self.customer_connections.clear()
        self.admin_connections.clear()

        # Reset status
        self.pool_status = PoolStatus.HEALTHY

        # Force garbage collection
        gc.collect()

        logger.info("Force cleanup completed")


# Global connection pool instance
connection_pool = ConnectionPool()
