"""
Enhanced API endpoints for product chat functionality
Implements proper validation, sanitization, and error handling
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import mysql.connector
from mysql.connector import Error
import logging
from datetime import datetime
import time
from functools import wraps
import asyncio
from contextlib import asynccontextmanager

from models.chat_models import (
    MessageCreate,
    ProductMessage,
    ProductInquiry,
    AdminResponse,
    MessageFilter,
    InquiryStatusUpdate,
    ChatSessionCreate,
    MessageReadUpdate,
)
from utils.validation import (
    validate_product_id,
    validate_session_id,
    validate_message_text,
    validate_pagination,
    validate_email,
    validate_customer_name,
    ValidationError,
    create_validation_error_response,
    log_validation_error
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting storage (in production, use Redis)
rate_limit_storage: Dict[str, List[float]] = {}


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """Rate limiting decorator"""

    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host
            current_time = time.time()

            # Clean old entries
            if client_ip in rate_limit_storage:
                rate_limit_storage[client_ip] = [
                    req_time
                    for req_time in rate_limit_storage[client_ip]
                    if current_time - req_time < window_seconds
                ]
            else:
                rate_limit_storage[client_ip] = []

            # Check rate limit
            if len(rate_limit_storage[client_ip]) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "message": f"Maximum {max_requests} requests per {window_seconds} seconds",
                        "retry_after": window_seconds,
                    },
                )

            # Add current request
            rate_limit_storage[client_ip].append(current_time)

            return await func(request, *args, **kwargs)

        return wrapper

    return decorator


@asynccontextmanager
async def get_db_connection():
    """Database connection context manager with proper error handling"""
    connection = None
    try:
        connection = get_db_connection_raw()
        yield connection
    except mysql.connector.Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Database error",
                "message": "A database error occurred. Please try again later.",
                "code": "DB_ERROR",
            },
        )
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "An unexpected error occurred. Please try again later.",
                "code": "INTERNAL_ERROR",
            },
        )
    finally:
        if connection and connection.is_connected():
            connection.close()


# Validation functions moved to utils/validation.py


router = APIRouter(prefix="/api/products", tags=["chat"])


def get_db_connection_raw():
    """Get raw database connection"""
    import os
    from dotenv import load_dotenv

    load_dotenv()

    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            autocommit=False,  # Explicit transaction control
            connection_timeout=10,  # 10 second timeout
            pool_name="chat_pool",
            pool_size=5,
            pool_reset_session=True,
        )
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection failed: {e}")
        raise


@router.get("/{product_id}/messages", response_model=dict)
@rate_limit(max_requests=30, window_seconds=60)
async def get_product_messages(
    request: Request,
    product_id: int,
    session_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """
    Get chat messages for a specific product with pagination support
    Returns messages with metadata for better history management
    """
    try:
        product_id = validate_product_id(product_id)
        limit, offset = validate_pagination(limit, offset)
        
        if session_id:
            session_id = validate_session_id(session_id)
    except ValidationError as e:
        log_validation_error(e, {"endpoint": "get_product_messages", "product_id": product_id})
        raise create_validation_error_response(e)

    async with get_db_connection() as connection:
        cursor = connection.cursor(dictionary=True)

        try:
            # First verify the product exists
            cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={
                        "error": "Product not found",
                        "message": f"Product with ID {product_id} does not exist",
                        "code": "PRODUCT_NOT_FOUND"
                    }
                )

        # Build query based on whether session_id is provided
        if session_id:
            # Get messages for specific session with pagination
            query = """
            SELECT cm.id, cm.session_id, cm.sender_type, cm.sender_id, cm.sender_name,
                   cm.message_text, cm.message_type, cm.is_read, cm.created_at, cm.updated_at
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.product_id = %s AND cs.session_id = %s
            ORDER BY cm.created_at ASC
            LIMIT %s OFFSET %s
            """
            cursor.execute(query, (product_id, session_id, limit, offset))
            messages = cursor.fetchall()

            # Get total count for pagination
            count_query = """
            SELECT COUNT(cm.id) as total_count
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.product_id = %s AND cs.session_id = %s
            """
            cursor.execute(count_query, (product_id, session_id))
            total_count = cursor.fetchone()["total_count"]

            # Get unread count for customer
            unread_query = """
            SELECT COUNT(cm.id) as unread_count
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.product_id = %s AND cs.session_id = %s 
            AND cm.is_read = FALSE AND cm.sender_type != 'customer'
            """
            cursor.execute(unread_query, (product_id, session_id))
            unread_count = cursor.fetchone()["unread_count"]

        else:
            # Get all messages for the product with pagination
            query = """
            SELECT cm.id, cm.session_id, cm.sender_type, cm.sender_id, cm.sender_name,
                   cm.message_text, cm.message_type, cm.is_read, cm.created_at, cm.updated_at
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.product_id = %s
            ORDER BY cm.created_at ASC
            LIMIT %s OFFSET %s
            """
            cursor.execute(query, (product_id, limit, offset))
            messages = cursor.fetchall()

            # Get total count for pagination
            count_query = """
            SELECT COUNT(cm.id) as total_count
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.product_id = %s
            """
            cursor.execute(count_query, (product_id,))
            total_count = cursor.fetchone()["total_count"]
            unread_count = 0

        # Calculate pagination metadata
        has_more = (offset + limit) < total_count
        has_previous = offset > 0

            return {
                "messages": messages,
                "pagination": {
                    "total_count": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": has_more,
                    "has_previous": has_previous,
                    "current_page": (offset // limit) + 1,
                    "total_pages": (total_count + limit - 1) // limit,
                },
                "unread_count": unread_count,
                "session_id": session_id,
            }

        except HTTPException:
            raise
        except mysql.connector.Error as e:
            logger.error(f"Database error retrieving messages for product {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "Database error",
                    "message": "Failed to retrieve messages due to database error",
                    "code": "DB_ERROR"
                }
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving messages for product {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "Internal server error",
                    "message": "Failed to retrieve messages",
                    "code": "INTERNAL_ERROR"
                }
            )
        finally:
            cursor.close()


@router.post("/{product_id}/messages", response_model=dict)
@rate_limit(max_requests=20, window_seconds=60)
async def send_product_message(
    request: Request, 
    product_id: int, 
    message: MessageCreate
):
    """
    Send a message about a specific product
    Handles both customer and admin messages with proper validation
    """
    validate_product_id(product_id)
    
    # Additional message validation
    if not message.message_text or len(message.message_text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid message",
                "message": "Message text cannot be empty",
                "code": "EMPTY_MESSAGE"
            }
        )
    
    if len(message.message_text) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid message",
                "message": "Message text cannot exceed 2000 characters",
                "code": "MESSAGE_TOO_LONG"
            }
        )

    async with get_db_connection() as connection:
        cursor = connection.cursor(dictionary=True)

    try:
        # Start transaction
        connection.start_transaction()

        # Verify product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Handle session creation or retrieval
        session_pk = None

        if message.session_id:
            # Check if session exists
            cursor.execute(
                "SELECT id FROM product_chat_sessions WHERE session_id = %s AND product_id = %s",
                (message.session_id, product_id),
            )
            session_data = cursor.fetchone()

            if session_data:
                session_pk = session_data["id"]
            else:
                # Create new session
                cursor.execute(
                    """
                    INSERT INTO product_chat_sessions 
                    (product_id, session_id, customer_email, status, priority, created_at, updated_at, last_message_at)
                    VALUES (%s, %s, %s, 'active', 'medium', NOW(), NOW(), NOW())
                    """,
                    (product_id, message.session_id, message.customer_email),
                )
                session_pk = cursor.lastrowid
        else:
            # Generate new session for anonymous user
            import uuid

            new_session_id = (
                f"chat_{int(datetime.now().timestamp())}_{str(uuid.uuid4())[:8]}"
            )

            cursor.execute(
                """
                INSERT INTO product_chat_sessions 
                (product_id, session_id, customer_email, status, priority, created_at, updated_at, last_message_at)
                VALUES (%s, %s, %s, 'active', 'medium', NOW(), NOW(), NOW())
                """,
                (product_id, new_session_id, message.customer_email),
            )
            session_pk = cursor.lastrowid
            message.session_id = new_session_id

        # Insert the message
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_name, message_text, message_type, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'text', NOW(), NOW())
            """,
            (session_pk, message.sender_type, None, message.message_text),
        )

        message_id = cursor.lastrowid

        # Update session last_message_at
        cursor.execute(
            "UPDATE product_chat_sessions SET last_message_at = NOW(), updated_at = NOW() WHERE id = %s",
            (session_pk,),
        )

        connection.commit()

        logger.info(
            f"Message sent successfully: product_id={product_id}, session_id={message.session_id}, message_id={message_id}"
        )

        return {
            "message": "Message sent successfully",
            "message_id": message_id,
            "session_id": message.session_id,
            "product_id": product_id,
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error sending message for product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")
    finally:
        cursor.close()
        connection.close()


@router.put("/{product_id}/messages/read", response_model=dict)
async def mark_messages_read(
    product_id: int, session_id: str, read_update: MessageReadUpdate
):
    """
    Mark messages as read in a product chat session
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="Session ID is required")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Verify session exists for this product
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s AND product_id = %s",
            (session_id, product_id),
        )
        session_data = cursor.fetchone()

        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        session_pk = session_data["id"]

        if read_update.mark_all:
            # Mark all messages in session as read
            cursor.execute(
                """
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s
                """,
                (session_pk,),
            )
            affected_rows = cursor.rowcount
        elif read_update.message_ids:
            # Mark specific messages as read
            if len(read_update.message_ids) > 100:
                raise HTTPException(
                    status_code=400, detail="Cannot mark more than 100 messages at once"
                )

            placeholders = ",".join(["%s"] * len(read_update.message_ids))
            cursor.execute(
                f"""
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s AND id IN ({placeholders})
                """,
                [session_pk] + read_update.message_ids,
            )
            affected_rows = cursor.rowcount
        else:
            raise HTTPException(
                status_code=400,
                detail="Either mark_all must be true or message_ids must be provided",
            )

        connection.commit()

        return {
            "message": f"Marked {affected_rows} messages as read",
            "affected_rows": affected_rows,
            "session_id": session_id,
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error marking messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark messages as read")
    finally:
        cursor.close()
        connection.close()


# Chat session management endpoints
@router.post("/{product_id}/chat/sessions", response_model=dict)
async def create_chat_session(product_id: int, session_data: ChatSessionCreate):
    """
    Create or retrieve a chat session for a product
    Handles session persistence and initialization
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Verify product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Check if session already exists
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s AND product_id = %s",
            (session_data.session_id, product_id),
        )
        existing_session = cursor.fetchone()

        if existing_session:
            session_pk = existing_session["id"]
            # Update existing session with new customer info if provided
            if session_data.customer_name or session_data.customer_email:
                cursor.execute(
                    """
                    UPDATE product_chat_sessions 
                    SET customer_name = COALESCE(%s, customer_name),
                        customer_email = COALESCE(%s, customer_email),
                        updated_at = NOW(),
                        last_message_at = NOW()
                    WHERE id = %s
                    """,
                    (
                        session_data.customer_name,
                        session_data.customer_email,
                        session_pk,
                    ),
                )
        else:
            # Create new session
            cursor.execute(
                """
                INSERT INTO product_chat_sessions 
                (product_id, session_id, customer_email, customer_name, status, priority, created_at, updated_at, last_message_at)
                VALUES (%s, %s, %s, %s, 'active', 'medium', NOW(), NOW(), NOW())
                """,
                (
                    product_id,
                    session_data.session_id,
                    session_data.customer_email,
                    session_data.customer_name,
                ),
            )
            session_pk = cursor.lastrowid

        # Add initial message if provided
        if session_data.initial_message:
            cursor.execute(
                """
                INSERT INTO product_chat_messages 
                (session_id, sender_type, sender_name, message_text, message_type, created_at, updated_at)
                VALUES (%s, 'customer', %s, %s, 'text', NOW(), NOW())
                """,
                (session_pk, session_data.customer_name, session_data.initial_message),
            )

        connection.commit()

        return {
            "message": "Chat session created successfully",
            "session_id": session_data.session_id,
            "product_id": product_id,
            "session_pk": session_pk,
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create chat session")
    finally:
        cursor.close()
        connection.close()


@router.get("/{product_id}/chat/sessions/{session_id}/messages", response_model=dict)
async def get_session_messages(
    product_id: int,
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    order: str = "asc",
):
    """
    Get messages for a specific chat session with enhanced pagination and history support
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if limit <= 0 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset must be non-negative")

    if order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="Order must be 'asc' or 'desc'")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Verify session exists for this product
        cursor.execute(
            """
            SELECT cs.id, cs.customer_name, cs.customer_email, cs.status, cs.created_at, cs.last_message_at
            FROM product_chat_sessions cs
            WHERE cs.session_id = %s AND cs.product_id = %s
            """,
            (session_id, product_id),
        )
        session_data = cursor.fetchone()

        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        session_pk = session_data["id"]

        # Get messages with pagination
        order_clause = "ASC" if order == "asc" else "DESC"
        query = f"""
        SELECT cm.id, cm.session_id, cm.sender_type, cm.sender_id, cm.sender_name,
               cm.message_text, cm.message_type, cm.is_read, cm.created_at, cm.updated_at
        FROM product_chat_messages cm
        WHERE cm.session_id = %s
        ORDER BY cm.created_at {order_clause}
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (session_pk, limit, offset))
        messages = cursor.fetchall()

        # Get total count for pagination
        cursor.execute(
            "SELECT COUNT(id) as total_count FROM product_chat_messages WHERE session_id = %s",
            (session_pk,),
        )
        total_count = cursor.fetchone()["total_count"]

        # Get unread count for customer (messages from admin/system that are unread)
        cursor.execute(
            """
            SELECT COUNT(id) as unread_count 
            FROM product_chat_messages 
            WHERE session_id = %s AND is_read = FALSE AND sender_type != 'customer'
            """,
            (session_pk,),
        )
        unread_count = cursor.fetchone()["unread_count"]

        # Calculate pagination metadata
        has_more = (offset + limit) < total_count
        has_previous = offset > 0

        return {
            "messages": messages,
            "session_info": {
                "session_id": session_id,
                "customer_name": session_data["customer_name"],
                "customer_email": session_data["customer_email"],
                "status": session_data["status"],
                "created_at": session_data["created_at"],
                "last_message_at": session_data["last_message_at"],
            },
            "pagination": {
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": has_more,
                "has_previous": has_previous,
                "current_page": (offset // limit) + 1,
                "total_pages": (total_count + limit - 1) // limit,
            },
            "unread_count": unread_count,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving session messages: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve session messages"
        )
    finally:
        cursor.close()
        connection.close()


@router.post("/{product_id}/chat/sessions/{session_id}/messages", response_model=dict)
async def send_session_message(
    product_id: int, session_id: str, message: MessageCreate
):
    """
    Send a message in a chat session with proper persistence
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Verify session exists for this product
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s AND product_id = %s",
            (session_id, product_id),
        )
        session_data = cursor.fetchone()

        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        session_pk = session_data["id"]

        # Insert the message with proper persistence
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_name, message_text, message_type, is_read, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'text', FALSE, NOW(), NOW())
            """,
            (
                session_pk,
                message.sender_type,
                message.customer_email or "Anonymous",
                message.message_text,
            ),
        )

        message_id = cursor.lastrowid

        # Update session last_message_at and activity
        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET last_message_at = NOW(), updated_at = NOW()
            WHERE id = %s
            """,
            (session_pk,),
        )

        connection.commit()

        logger.info(
            f"Message sent successfully: product_id={product_id}, session_id={session_id}, message_id={message_id}"
        )

        return {
            "message": "Message sent successfully",
            "message_id": message_id,
            "session_id": session_id,
            "product_id": product_id,
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")
    finally:
        cursor.close()
        connection.close()


@router.put(
    "/{product_id}/chat/sessions/{session_id}/messages/read", response_model=dict
)
async def mark_session_messages_read(
    product_id: int, session_id: str, read_update: MessageReadUpdate
):
    """
    Mark messages as read in a chat session with enhanced tracking
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="Session ID is required")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Verify session exists for this product
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s AND product_id = %s",
            (session_id, product_id),
        )
        session_data = cursor.fetchone()

        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        session_pk = session_data["id"]

        if read_update.mark_all:
            # Mark all unread messages in session as read
            cursor.execute(
                """
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s AND is_read = FALSE
                """,
                (session_pk,),
            )
            affected_rows = cursor.rowcount
        elif read_update.message_ids:
            # Mark specific messages as read
            if len(read_update.message_ids) > 100:
                raise HTTPException(
                    status_code=400, detail="Cannot mark more than 100 messages at once"
                )

            placeholders = ",".join(["%s"] * len(read_update.message_ids))
            cursor.execute(
                f"""
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s AND id IN ({placeholders}) AND is_read = FALSE
                """,
                [session_pk] + read_update.message_ids,
            )
            affected_rows = cursor.rowcount
        else:
            raise HTTPException(
                status_code=400,
                detail="Either mark_all must be true or message_ids must be provided",
            )

        connection.commit()

        return {
            "message": f"Marked {affected_rows} messages as read",
            "affected_rows": affected_rows,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        logger.error(f"Error marking messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark messages as read")
    finally:
        cursor.close()
        connection.close()


@router.get("/{product_id}/inquiries", response_model=List[ProductInquiry])
async def get_product_inquiries(
    product_id: int, status: Optional[str] = None, limit: int = 20, offset: int = 0
):
    """
    Get chat inquiries/sessions for a specific product
    Used primarily by admin interface
    """
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if limit <= 0 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Build query with optional status filter
        where_conditions = ["cs.product_id = %s"]
        params = [product_id]

        if status:
            valid_statuses = ["active", "pending", "in_progress", "resolved", "closed"]
            if status not in valid_statuses:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status. Must be one of: {valid_statuses}",
                )
            where_conditions.append("cs.status = %s")
            params.append(status)

        where_clause = " AND ".join(where_conditions)

        query = f"""
        SELECT cs.id, cs.product_id, cs.session_id, cs.customer_email, cs.customer_name,
               cs.status, cs.priority, cs.created_at, cs.updated_at, cs.last_message_at,
               cs.assigned_admin_id, p.name as product_name,
               COUNT(cm.id) as total_messages,
               COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_messages
        FROM product_chat_sessions cs
        LEFT JOIN products p ON cs.product_id = p.id
        LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
        WHERE {where_clause}
        GROUP BY cs.id, cs.product_id, cs.session_id, cs.customer_email, cs.customer_name,
                 cs.status, cs.priority, cs.created_at, cs.updated_at, cs.last_message_at,
                 cs.assigned_admin_id, p.name
        ORDER BY cs.last_message_at DESC
        LIMIT %s OFFSET %s
        """

        params.extend([limit, offset])
        cursor.execute(query, params)

        inquiries = cursor.fetchall()
        return inquiries

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving inquiries for product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve inquiries")
    finally:
        cursor.close()
        connection.close()
