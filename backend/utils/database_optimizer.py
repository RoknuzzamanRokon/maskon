"""
Database optimization utilities for chat functionality
Provides query optimization, indexing, and performance monitoring
"""

import logging
import time
from typing import Dict, List, Optional, Tuple, Any
from contextlib import contextmanager
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class QueryPerformanceMonitor:
    """Monitor and log database query performance"""

    def __init__(self):
        self.query_stats: Dict[str, Dict] = {}
        self.slow_query_threshold = 1.0  # seconds

    def record_query(self, query_type: str, execution_time: float, query: str = None):
        """Record query execution statistics"""
        if query_type not in self.query_stats:
            self.query_stats[query_type] = {
                "count": 0,
                "total_time": 0.0,
                "avg_time": 0.0,
                "max_time": 0.0,
                "slow_queries": 0,
            }

        stats = self.query_stats[query_type]
        stats["count"] += 1
        stats["total_time"] += execution_time
        stats["avg_time"] = stats["total_time"] / stats["count"]
        stats["max_time"] = max(stats["max_time"], execution_time)

        if execution_time > self.slow_query_threshold:
            stats["slow_queries"] += 1
            logger.warning(
                f"Slow query detected: {query_type} took {execution_time:.3f}s"
                + (f" - Query: {query[:200]}..." if query else "")
            )

    def get_stats(self) -> Dict:
        """Get query performance statistics"""
        return self.query_stats.copy()

    def reset_stats(self):
        """Reset all statistics"""
        self.query_stats.clear()


# Global performance monitor
query_monitor = QueryPerformanceMonitor()


@contextmanager
def monitored_db_connection():
    """Context manager for monitored database connections"""
    connection = None
    start_time = time.time()

    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            autocommit=False,
            use_unicode=True,
            charset="utf8mb4",
            # Connection pool settings
            pool_name="chat_pool",
            pool_size=10,
            pool_reset_session=True,
            # Performance settings
            buffered=True,
            raise_on_warnings=True,
        )

        connection_time = time.time() - start_time
        query_monitor.record_query("connection", connection_time)

        yield connection

    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()


@contextmanager
def monitored_cursor(connection, query_type: str = "unknown"):
    """Context manager for monitored database cursors"""
    cursor = None
    start_time = time.time()

    try:
        cursor = connection.cursor(dictionary=True, buffered=True)
        yield cursor

        execution_time = time.time() - start_time
        query_monitor.record_query(query_type, execution_time)

    except Error as e:
        logger.error(f"Database cursor error in {query_type}: {e}")
        raise
    finally:
        if cursor:
            cursor.close()


class OptimizedChatQueries:
    """Optimized database queries for chat functionality"""

    @staticmethod
    def get_chat_messages_optimized(
        session_key: str,
        limit: int = 50,
        offset: int = 0,
        include_read_status: bool = True,
    ) -> List[Dict]:
        """
        Get chat messages with optimized query

        Uses proper indexing and limits data transfer
        """
        with monitored_db_connection() as connection:
            with monitored_cursor(connection, "get_messages") as cursor:
                # Optimized query using indexes
                query = """
                SELECT 
                    cm.id,
                    cm.sender_type,
                    cm.sender_id,
                    cm.sender_name,
                    cm.message_text,
                    cm.message_type,
                    cm.is_read,
                    cm.created_at,
                    cs.product_id,
                    p.name as product_name
                FROM product_chat_messages cm
                INNER JOIN product_chat_sessions cs ON cm.session_id = cs.id
                INNER JOIN products p ON cs.product_id = p.id
                WHERE cs.session_id = %s
                ORDER BY cm.created_at DESC
                LIMIT %s OFFSET %s
                """

                cursor.execute(query, (session_key, limit, offset))
                messages = cursor.fetchall()

                # Reverse to get chronological order
                return list(reversed(messages))

    @staticmethod
    def get_admin_inquiries_optimized(
        status: str = None,
        assigned_admin_id: int = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict]:
        """Get admin inquiries with optimized query"""
        with monitored_db_connection() as connection:
            with monitored_cursor(connection, "get_inquiries") as cursor:
                # Build dynamic query with proper indexing
                conditions = []
                params = []

                if status:
                    conditions.append("cs.status = %s")
                    params.append(status)

                if assigned_admin_id:
                    conditions.append("cs.assigned_admin_id = %s")
                    params.append(assigned_admin_id)

                where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

                query = f"""
                SELECT 
                    cs.id,
                    cs.session_id,
                    cs.product_id,
                    p.name as product_name,
                    p.price as product_price,
                    cs.customer_email,
                    cs.customer_name,
                    cs.status,
                    cs.priority,
                    cs.created_at,
                    cs.last_message_at,
                    cs.assigned_admin_id,
                    u.username as assigned_admin_name,
                    COUNT(cm.id) as total_messages,
                    COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_messages
                FROM product_chat_sessions cs
                LEFT JOIN products p ON cs.product_id = p.id
                LEFT JOIN users u ON cs.assigned_admin_id = u.id
                LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
                {where_clause}
                GROUP BY cs.id, cs.session_id, cs.product_id, p.name, p.price, 
                         cs.customer_email, cs.customer_name, cs.status, cs.priority,
                         cs.created_at, cs.last_message_at, cs.assigned_admin_id, u.username
                ORDER BY cs.last_message_at DESC
                LIMIT %s OFFSET %s
                """

                params.extend([limit, offset])
                cursor.execute(query, params)
                return cursor.fetchall()

    @staticmethod
    def create_chat_session_optimized(
        product_id: int,
        session_id: str,
        customer_email: str = None,
        customer_name: str = None,
        initial_message: str = None,
    ) -> int:
        """Create chat session with optimized transaction"""
        with monitored_db_connection() as connection:
            try:
                connection.start_transaction()

                with monitored_cursor(connection, "create_session") as cursor:
                    # Insert session
                    session_query = """
                    INSERT INTO product_chat_sessions 
                    (product_id, session_id, customer_email, customer_name, status, priority)
                    VALUES (%s, %s, %s, %s, 'pending', 'medium')
                    """

                    cursor.execute(
                        session_query,
                        (product_id, session_id, customer_email, customer_name),
                    )

                    session_pk = cursor.lastrowid

                    # Insert initial message if provided
                    if initial_message:
                        message_query = """
                        INSERT INTO product_chat_messages 
                        (session_id, sender_type, sender_name, message_text, message_type)
                        VALUES (%s, 'customer', %s, %s, 'text')
                        """

                        cursor.execute(
                            message_query,
                            (session_pk, customer_name or "Anonymous", initial_message),
                        )

                connection.commit()
                return session_pk

            except Exception as e:
                connection.rollback()
                logger.error(f"Error creating chat session: {e}")
                raise

    @staticmethod
    def send_message_optimized(
        session_key: str,
        sender_type: str,
        sender_id: int = None,
        sender_name: str = None,
        message_text: str = None,
        message_type: str = "text",
    ) -> int:
        """Send message with optimized transaction"""
        with monitored_db_connection() as connection:
            try:
                connection.start_transaction()

                with monitored_cursor(connection, "send_message") as cursor:
                    # Get session ID
                    cursor.execute(
                        "SELECT id FROM product_chat_sessions WHERE session_id = %s",
                        (session_key,),
                    )
                    session_result = cursor.fetchone()

                    if not session_result:
                        raise ValueError("Chat session not found")

                    session_pk = session_result["id"]

                    # Insert message
                    message_query = """
                    INSERT INTO product_chat_messages 
                    (session_id, sender_type, sender_id, sender_name, message_text, message_type)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """

                    cursor.execute(
                        message_query,
                        (
                            session_pk,
                            sender_type,
                            sender_id,
                            sender_name,
                            message_text,
                            message_type,
                        ),
                    )

                    message_id = cursor.lastrowid

                    # Update session last_message_at (trigger should handle this, but ensure it)
                    cursor.execute(
                        "UPDATE product_chat_sessions SET last_message_at = NOW() WHERE id = %s",
                        (session_pk,),
                    )

                connection.commit()
                return message_id

            except Exception as e:
                connection.rollback()
                logger.error(f"Error sending message: {e}")
                raise

    @staticmethod
    def mark_messages_read_optimized(session_key: str, message_ids: List[int] = None):
        """Mark messages as read with optimized query"""
        with monitored_db_connection() as connection:
            with monitored_cursor(connection, "mark_read") as cursor:
                if message_ids:
                    # Mark specific messages as read
                    placeholders = ",".join(["%s"] * len(message_ids))
                    query = f"""
                    UPDATE product_chat_messages cm
                    INNER JOIN product_chat_sessions cs ON cm.session_id = cs.id
                    SET cm.is_read = TRUE
                    WHERE cs.session_id = %s AND cm.id IN ({placeholders})
                    """
                    params = [session_key] + message_ids
                else:
                    # Mark all messages in session as read
                    query = """
                    UPDATE product_chat_messages cm
                    INNER JOIN product_chat_sessions cs ON cm.session_id = cs.id
                    SET cm.is_read = TRUE
                    WHERE cs.session_id = %s AND cm.is_read = FALSE
                    """
                    params = [session_key]

                cursor.execute(query, params)
                connection.commit()

                return cursor.rowcount


class DatabaseIndexOptimizer:
    """Utilities for database index optimization"""

    @staticmethod
    def analyze_query_performance() -> Dict:
        """Analyze query performance and suggest optimizations"""
        with monitored_db_connection() as connection:
            with monitored_cursor(connection, "analyze_performance") as cursor:
                # Check for missing indexes
                missing_indexes = []

                # Check slow query log (if enabled)
                try:
                    cursor.execute("SHOW VARIABLES LIKE 'slow_query_log'")
                    slow_log_status = cursor.fetchone()

                    if slow_log_status and slow_log_status["Value"] == "ON":
                        # Analyze slow queries (simplified)
                        cursor.execute(
                            """
                        SELECT 
                            SCHEMA_NAME,
                            DIGEST_TEXT,
                            COUNT_STAR,
                            AVG_TIMER_WAIT/1000000000 as avg_time_seconds,
                            MAX_TIMER_WAIT/1000000000 as max_time_seconds
                        FROM performance_schema.events_statements_summary_by_digest
                        WHERE SCHEMA_NAME = %s
                        ORDER BY AVG_TIMER_WAIT DESC
                        LIMIT 10
                        """,
                            (os.getenv("DB_NAME", "blog_portfolio"),),
                        )

                        slow_queries = cursor.fetchall()
                    else:
                        slow_queries = []

                except Exception as e:
                    logger.warning(f"Could not analyze slow queries: {e}")
                    slow_queries = []

                # Check index usage
                cursor.execute(
                    """
                SELECT 
                    TABLE_NAME,
                    INDEX_NAME,
                    COLUMN_NAME,
                    CARDINALITY,
                    SUB_PART
                FROM INFORMATION_SCHEMA.STATISTICS
                WHERE TABLE_SCHEMA = %s
                AND TABLE_NAME LIKE '%chat%'
                ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
                """,
                    (os.getenv("DB_NAME", "blog_portfolio"),),
                )

                indexes = cursor.fetchall()

                return {
                    "slow_queries": slow_queries,
                    "indexes": indexes,
                    "missing_indexes": missing_indexes,
                    "query_stats": query_monitor.get_stats(),
                }

    @staticmethod
    def optimize_chat_indexes():
        """Create or optimize indexes for chat tables"""
        with monitored_db_connection() as connection:
            with monitored_cursor(connection, "optimize_indexes") as cursor:
                optimizations = []

                try:
                    # Check if indexes exist and create if missing
                    index_queries = [
                        # Composite index for message retrieval
                        """
                        CREATE INDEX IF NOT EXISTS idx_messages_session_created 
                        ON product_chat_messages (session_id, created_at DESC)
                        """,
                        # Index for unread message queries
                        """
                        CREATE INDEX IF NOT EXISTS idx_messages_unread_sender 
                        ON product_chat_messages (is_read, sender_type, created_at)
                        """,
                        # Index for admin inquiry queries
                        """
                        CREATE INDEX IF NOT EXISTS idx_sessions_status_priority 
                        ON product_chat_sessions (status, priority, last_message_at DESC)
                        """,
                        # Index for session lookup by product
                        """
                        CREATE INDEX IF NOT EXISTS idx_sessions_product_status 
                        ON product_chat_sessions (product_id, status, created_at DESC)
                        """,
                        # Full-text index for message search (if needed)
                        """
                        CREATE FULLTEXT INDEX IF NOT EXISTS idx_messages_fulltext 
                        ON product_chat_messages (message_text)
                        """,
                    ]

                    for query in index_queries:
                        try:
                            cursor.execute(query)
                            optimizations.append(
                                f"Executed: {query.split()[2]} {query.split()[5]}"
                            )
                        except Error as e:
                            if "Duplicate key name" not in str(e):
                                logger.warning(f"Index creation warning: {e}")

                    connection.commit()

                except Exception as e:
                    connection.rollback()
                    logger.error(f"Error optimizing indexes: {e}")
                    raise

                return optimizations

    @staticmethod
    def cleanup_old_data(days_to_keep: int = 90):
        """Clean up old chat data to maintain performance"""
        with monitored_db_connection() as connection:
            try:
                connection.start_transaction()

                with monitored_cursor(connection, "cleanup_old_data") as cursor:
                    cutoff_date = datetime.now() - timedelta(days=days_to_keep)

                    # Delete old resolved/closed sessions and their messages
                    cleanup_query = """
                    DELETE cs, cm FROM product_chat_sessions cs
                    LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
                    WHERE cs.status IN ('resolved', 'closed')
                    AND cs.updated_at < %s
                    """

                    cursor.execute(cleanup_query, (cutoff_date,))
                    deleted_count = cursor.rowcount

                    # Optimize tables after cleanup
                    cursor.execute("OPTIMIZE TABLE product_chat_sessions")
                    cursor.execute("OPTIMIZE TABLE product_chat_messages")

                connection.commit()

                logger.info(f"Cleaned up {deleted_count} old chat records")
                return deleted_count

            except Exception as e:
                connection.rollback()
                logger.error(f"Error cleaning up old data: {e}")
                raise


# Global database optimizer instance
db_optimizer = DatabaseIndexOptimizer()
