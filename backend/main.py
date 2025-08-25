from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    UploadFile,
    File,
    status,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import uuid
import shutil
import jwt
from passlib.context import CryptContext
import hashlib
import json
import asyncio
import logging
from websocket_manager import websocket_manager, ConnectionType, MessageType

# Import notification service
from utils.notification_service import get_notification_service

# Import enhanced security and performance utilities
try:
    from utils.message_sanitizer import (
        sanitize_message_text,
        sanitize_user_name,
        validate_email,
        validate_session_id,
        check_rate_limit_content,
        sanitize_admin_message,
        validate_message_content_security,
        get_content_security_score,
    )
    from utils.rate_limiter import chat_rate_limiter, RateLimitExceeded
    from utils.connection_pool import connection_pool
    from utils.database_optimizer import OptimizedChatQueries, db_optimizer
except ImportError:
    # Fallback functions if utils module is not available
    import html
    import re

    def sanitize_message_text(text: str, max_length: int = 2000) -> str:
        if not text or not text.strip():
            raise ValueError("Message text cannot be empty")
        text = text.strip()
        if len(text) > max_length:
            raise ValueError(f"Message text cannot exceed {max_length} characters")
        return html.escape(text)

    def sanitize_user_name(name: str, max_length: int = 255) -> str:
        if not name or not name.strip():
            return ""
        name = name.strip()[:max_length]
        return html.escape(re.sub(r"[^\w\s\-\.\']", "", name))

    def validate_email(email: str):
        if not email or not email.strip():
            return None
        email = email.strip().lower()
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email):
            raise ValueError("Invalid email format")
        return email

    def validate_session_id(session_id: str) -> str:
        if not session_id or not session_id.strip():
            raise ValueError("Session ID cannot be empty")
        return session_id.strip()

    def check_rate_limit_content(text: str) -> bool:
        return False

    def sanitize_admin_message(text: str, max_length: int = 2000) -> str:
        return sanitize_message_text(text, max_length)

    def validate_message_content_security(text: str):
        return []

    def get_content_security_score(text: str) -> float:
        return 1.0

    # Mock rate limiter
    class MockRateLimiter:
        def check_message_rate_limit(self, ip, session_id=None, message_length=0):
            return True, None, None

        def check_connection_rate_limit(self, ip):
            return True, None, None

        def check_session_creation_rate_limit(self, ip):
            return True, None, None

    chat_rate_limiter = MockRateLimiter()

    class RateLimitExceeded(Exception):
        pass

    # Mock connection pool
    class MockConnectionPool:
        def can_accept_connection(self, ip):
            return True, None

        def register_connection(self, *args, **kwargs):
            pass

        def unregister_connection(self, connection_id):
            pass

        def update_connection_activity(self, *args, **kwargs):
            pass

    connection_pool = MockConnectionPool()

    # Mock database optimizer
    class MockOptimizedQueries:
        @staticmethod
        def get_chat_messages_optimized(*args, **kwargs):
            return []

        @staticmethod
        def create_chat_session_optimized(*args, **kwargs):
            return 1

        @staticmethod
        def send_message_optimized(*args, **kwargs):
            return 1

    OptimizedChatQueries = MockOptimizedQueries


load_dotenv()

app = FastAPI(title="Blog & Portfolio API", version="1.0.0")

# Initialize notification service
notification_service = get_notification_service(websocket_manager)

# Set up logging
logger = logging.getLogger(__name__)


# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # print(f"Request: {request.method} {request.url}")
    # print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    # print(f"Response status: {response.status_code}")
    return response


# Add rate limiting middleware for chat endpoints
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Rate limiting middleware for chat-related endpoints"""
    client_ip = request.client.host
    path = request.url.path

    # Apply rate limiting to chat endpoints
    if "/api/chat" in path or "/api/products/" in path and "/messages" in path:
        try:
            # Check connection rate limit for new connections
            if request.method == "POST" and "messages" in path:
                allowed, retry_after, reason = (
                    chat_rate_limiter.check_message_rate_limit(
                        client_ip,
                        session_id=request.headers.get("X-Session-ID"),
                        message_length=(
                            len(await request.body()) if hasattr(request, "body") else 0
                        ),
                    )
                )

                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "reason": reason,
                            "retry_after": retry_after,
                        },
                        headers=(
                            {"Retry-After": str(retry_after)} if retry_after else {}
                        ),
                    )

            # Check session creation rate limit
            elif request.method == "POST" and "chat" in path and "session" in path:
                allowed, retry_after, reason = (
                    chat_rate_limiter.check_session_creation_rate_limit(client_ip)
                )

                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "reason": reason,
                            "retry_after": retry_after,
                        },
                        headers=(
                            {"Retry-After": str(retry_after)} if retry_after else {}
                        ),
                    )

        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Continue processing if rate limiting fails

    response = await call_next(request)
    return response


# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
        )
        return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")


# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    is_admin: bool


class PostCreate(BaseModel):
    title: str
    content: str
    category: str  # tech, food, activity
    tags: Optional[str] = None
    image_url: Optional[str] = None  # Keep for backward compatibility
    media_urls: Optional[List[dict]] = None  # New field for multiple media


class Post(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: Optional[str] = None
    image_url: Optional[str] = None
    media_urls: Optional[List[dict]] = None
    likes_count: Optional[int] = 0
    dislikes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime


class CommentCreate(BaseModel):
    content: str


class Comment(BaseModel):
    id: int
    post_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime


class PostInteraction(BaseModel):
    post_id: int
    interaction_type: str  # 'like' or 'dislike'


class PortfolioItem(BaseModel):
    id: int
    title: str
    description: str
    technologies: str
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime


class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    stock: int
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_urls: List[str] = []  # Changed from image_url to image_urls
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductImage(BaseModel):
    id: int
    image_url: str
    is_primary: bool


class Product(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float
    stock: int
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_urls: List[str] = []  # Changed from image_url to image_urls
    images: List[ProductImage] = []  # Full image objects with is_primary
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None


class ProductInquiry(BaseModel):
    product_id: int
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    message: Optional[str] = None
    inquiry_type: str = "purchase"


# Chat functionality models
class ChatSessionCreate(BaseModel):
    product_id: int
    session_id: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    initial_message: Optional[str] = None


class ChatMessageCreate(BaseModel):
    session_id: str
    message_text: str
    sender_type: str = "customer"  # customer, admin, system
    sender_name: Optional[str] = None


class ChatMessage(BaseModel):
    id: int
    session_id: int
    sender_type: str
    sender_id: Optional[int]
    sender_name: Optional[str]
    message_text: str
    message_type: str
    is_read: bool
    created_at: datetime
    updated_at: datetime


class ChatSession(BaseModel):
    id: int
    product_id: int
    session_id: str
    customer_email: Optional[str]
    customer_name: Optional[str]
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime
    assigned_admin_id: Optional[int]
    product_name: Optional[str] = None
    total_messages: int = 0
    unread_messages: int = 0


class AdminResponse(BaseModel):
    message_text: str
    admin_id: int
    admin_name: Optional[str] = None


class InquiryStatusUpdate(BaseModel):
    status: str  # pending, in_progress, resolved, closed
    assigned_admin_id: Optional[int] = None


class InquiryFilter(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    product_id: Optional[int] = None
    limit: int = 20
    offset: int = 0


# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
        # Convert string user_id back to integer
        user_id = int(user_id_str)
        return user_id
    except (jwt.PyJWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )


def get_current_admin(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user or not user["is_admin"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user_id
    finally:
        cursor.close()
        connection.close()


@app.get("/")
@app.head("/")
async def root():
    return {"message": "Blog & Portfolio API"}


@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()

        # Get additional health metrics
        health_data = {"status": "healthy", "database": "connected"}

        # Add rate limiter stats if available
        try:
            health_data["rate_limiter"] = chat_rate_limiter.get_stats()
        except:
            pass

        # Add connection pool stats if available
        try:
            pool_metrics = connection_pool.get_metrics()
            health_data["connection_pool"] = pool_metrics.to_dict()
        except:
            pass

        # Add WebSocket stats
        try:
            health_data["websocket"] = websocket_manager.get_connection_stats()
        except:
            pass

        return health_data
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.get("/api/debug/websocket-status")
async def debug_websocket_status():
    """Debug endpoint to check WebSocket connection status"""
    try:
        debug_info = {
            "timestamp": datetime.utcnow().isoformat(),
            "rate_limiter": {
                "stats": chat_rate_limiter.get_stats(),
                "connection_limit": "50 connections per 5 minutes",
                "message_limit": "30 messages per minute",
            },
            "connection_pool": {
                "metrics": connection_pool.get_metrics().to_dict(),
                "max_connections": connection_pool.max_connections,
                "max_per_ip": connection_pool.max_connections_per_ip,
            },
            "websocket_manager": {
                "stats": websocket_manager.get_connection_stats(),
                "active_connections": len(websocket_manager.connections),
            },
        }
        return debug_info
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/debug/reset-rate-limits")
async def reset_rate_limits():
    """Debug endpoint to reset rate limits (for testing)"""
    try:
        # Reset rate limiter stats
        chat_rate_limiter.message_limiter.requests.clear()
        chat_rate_limiter.connection_limiter.requests.clear()
        chat_rate_limiter.session_limiter.requests.clear()
        chat_rate_limiter.blocked_until.clear()
        chat_rate_limiter.suspicious_activity.clear()
        chat_rate_limiter.token_buckets.clear()

        return {
            "message": "Rate limits reset successfully",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/debug/cleanup-websockets")
async def cleanup_websockets():
    """Debug endpoint to manually trigger WebSocket cleanup"""
    try:
        # Clean up stale connections
        stale_count = await websocket_manager.cleanup_stale_connections()

        # Clean up inactive connections
        await websocket_manager.cleanup_inactive_connections()

        # Get current stats
        stats = websocket_manager.get_connection_stats()

        return {
            "message": "WebSocket cleanup completed",
            "stale_connections_cleaned": stale_count,
            "current_stats": stats,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/admin/security-stats")
async def get_security_stats(admin_id: int = Depends(get_current_admin)):
    """Get security and performance statistics (admin only)"""
    try:
        stats = {
            "rate_limiter": chat_rate_limiter.get_stats(),
            "connection_pool": connection_pool.get_metrics().to_dict(),
            "websocket_manager": websocket_manager.get_connection_stats(),
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Add database performance stats if available
        try:
            stats["database_performance"] = db_optimizer.analyze_query_performance()
        except:
            stats["database_performance"] = {
                "error": "Database performance analysis not available"
            }

        return stats
    except Exception as e:
        logger.error(f"Error getting security stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve security statistics"
        )


@app.post("/api/admin/optimize-database")
async def optimize_database(admin_id: int = Depends(get_current_admin)):
    """Optimize database indexes and performance (admin only)"""
    try:
        optimizations = db_optimizer.optimize_chat_indexes()
        return {
            "message": "Database optimization completed",
            "optimizations": optimizations,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error optimizing database: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize database")


@app.post("/api/admin/cleanup-old-data")
async def cleanup_old_data(
    days_to_keep: int = 90, admin_id: int = Depends(get_current_admin)
):
    """Clean up old chat data (admin only)"""
    try:
        deleted_count = db_optimizer.cleanup_old_data(days_to_keep)
        return {
            "message": f"Cleaned up {deleted_count} old records",
            "deleted_count": deleted_count,
            "days_kept": days_to_keep,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error cleaning up old data: {e}")
        raise HTTPException(status_code=500, detail="Failed to clean up old data")


# Create static directory if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Registration disabled - Admin only system
@app.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    raise HTTPException(
        status_code=403,
        detail="Registration is disabled. This is an admin-only system.",
    )


@app.options("/api/login")
async def login_options():
    return {"message": "OK"}


@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    print(f"Login attempt for username: {user.username}")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, password_hash, is_admin FROM users WHERE username = %s",
            (user.username,),
        )
        db_user = cursor.fetchone()
        print(f"User found in database: {db_user is not None}")

        if not db_user:
            print("User not found in database")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        password_valid = verify_password(user.password, db_user["password_hash"])
        print(f"Password valid: {password_valid}")

        if not password_valid:
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user["id"])}, expires_delta=access_token_expires
        )

        print("Login successful, returning token")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user["id"],
            "username": db_user["username"],
            "is_admin": db_user["is_admin"],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        cursor.close()
        connection.close()


@app.get("/api/me")
async def get_current_user_info(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, email, is_admin FROM users WHERE id = %s", (user_id,)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        cursor.close()
        connection.close()


@app.get("/api/debug/auth")
async def debug_auth_info(user_id: int = Depends(get_current_user)):
    """Debug endpoint to check authentication status"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, email, is_admin FROM users WHERE id = %s", (user_id,)
        )
        user = cursor.fetchone()
        return {
            "authenticated": True,
            "user_id": user_id,
            "user_info": user,
            "is_admin": user["is_admin"] if user else False,
            "timestamp": datetime.utcnow().isoformat(),
        }
    finally:
        cursor.close()
        connection.close()


@app.post("/api/upload-media")
async def upload_media(
    files: List[UploadFile] = File(...), admin_id: int = Depends(get_current_admin)
):
    UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    uploaded_files = []
    allowed_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    allowed_video_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
    ]

    for file in files:
        # Check file type
        if file.content_type not in allowed_image_types + allowed_video_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Only images and videos are supported.",
            )

        # Check file size (50MB limit for videos, 10MB for images)
        file_size_limit = (
            50 * 1024 * 1024
            if file.content_type in allowed_video_types
            else 10 * 1024 * 1024
        )

        file_extension = file.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Get file size after upload
            file_size = os.path.getsize(file_path)
            if file_size > file_size_limit:
                os.remove(file_path)  # Remove the file
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {file_size_limit // (1024*1024)}MB",
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
        finally:
            file.file.close()

        # Construct the full URL for the uploaded file
        base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        file_url = f"{base_url}/static/uploads/{unique_filename}"

        # Determine media type
        media_type = "image" if file.content_type in allowed_image_types else "video"

        uploaded_files.append(
            {
                "filename": unique_filename,
                "url": file_url,
                "type": media_type,
                "original_name": file.filename,
            }
        )

    return {"uploaded_files": uploaded_files}


# Keep the old single image upload for backward compatibility
@app.post("/api/upload-image")
async def upload_single_image(
    file: UploadFile = File(...), admin_id: int = Depends(get_current_admin)
):
    result = await upload_media([file], admin_id)
    if result["uploaded_files"]:
        return result["uploaded_files"][0]
    else:
        raise HTTPException(status_code=500, detail="Upload failed")


@app.get("/api/posts", response_model=List[Post])
async def get_posts(category: Optional[str] = None, limit: int = 10):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if category:
            query = "SELECT * FROM posts WHERE category = %s ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (category, limit))
        else:
            query = "SELECT * FROM posts ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (limit,))

        posts = cursor.fetchall()

        # Parse media_urls JSON field
        import json

        for post in posts:
            if post.get("media_urls"):
                try:
                    post["media_urls"] = json.loads(post["media_urls"])
                except (json.JSONDecodeError, TypeError):
                    post["media_urls"] = None
            else:
                post["media_urls"] = None

        return posts
    finally:
        cursor.close()
        connection.close()


@app.post("/api/posts", response_model=dict)
async def create_post(post: PostCreate, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Convert media_urls to JSON string if provided
        media_urls_json = None
        if post.media_urls:
            import json

            media_urls_json = json.dumps(post.media_urls)

        query = """
        INSERT INTO posts (title, content, category, tags, image_url, media_urls, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                post.title,
                post.content,
                post.category,
                post.tags,
                post.image_url,
                media_urls_json,
            ),
        )
        connection.commit()
        post_id = cursor.lastrowid

        return {"message": "Post created successfully", "id": post_id}
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: int, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete related comments and interactions first
        cursor.execute("DELETE FROM comments WHERE post_id = %s", (post_id,))
        cursor.execute("DELETE FROM post_interactions WHERE post_id = %s", (post_id,))

        # Delete the post
        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Post not found")

        connection.commit()
        return {"message": "Post deleted successfully"}
    finally:
        cursor.close()
        connection.close()


# Anonymous user interactions (likes/dislikes)
@app.post("/api/posts/{post_id}/interact")
async def interact_with_post(
    post_id: int, interaction: PostInteraction, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Use IP address as anonymous user identifier
        client_ip = request.client.host
        anonymous_user_id = f"anon_{client_ip}"

        # Check if this IP already interacted with this post
        cursor.execute(
            "SELECT interaction_type FROM anonymous_interactions WHERE post_id = %s AND user_identifier = %s",
            (post_id, anonymous_user_id),
        )
        existing = cursor.fetchone()

        if existing:
            if existing[0] == interaction.interaction_type:
                # Remove interaction if same type (toggle off)
                cursor.execute(
                    "DELETE FROM anonymous_interactions WHERE post_id = %s AND user_identifier = %s",
                    (post_id, anonymous_user_id),
                )
                message = f"{interaction.interaction_type} removed"
            else:
                # Update interaction type
                cursor.execute(
                    "UPDATE anonymous_interactions SET interaction_type = %s WHERE post_id = %s AND user_identifier = %s",
                    (interaction.interaction_type, post_id, anonymous_user_id),
                )
                message = f"Changed to {interaction.interaction_type}"
        else:
            # Add new interaction
            cursor.execute(
                "INSERT INTO anonymous_interactions (post_id, user_identifier, interaction_type, created_at) VALUES (%s, %s, %s, NOW())",
                (post_id, anonymous_user_id, interaction.interaction_type),
            )
            message = f"{interaction.interaction_type} added"

        connection.commit()

        # Get updated counts
        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_interactions WHERE post_id = %s AND interaction_type = 'like'",
            (post_id,),
        )
        likes_count = cursor.fetchone()[0]

        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_interactions WHERE post_id = %s AND interaction_type = 'dislike'",
            (post_id,),
        )
        dislikes_count = cursor.fetchone()[0]

        # Update post counts
        cursor.execute(
            "UPDATE posts SET likes_count = %s, dislikes_count = %s WHERE id = %s",
            (likes_count, dislikes_count, post_id),
        )
        connection.commit()

        return {
            "message": message,
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
        }
    finally:
        cursor.close()
        connection.close()


# Anonymous comments
class AnonymousCommentCreate(BaseModel):
    content: str
    username: str  # Display name for anonymous user


@app.post("/api/posts/{post_id}/comments")
async def add_anonymous_comment(
    post_id: int, comment: AnonymousCommentCreate, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Use IP address as anonymous user identifier
        client_ip = request.client.host
        anonymous_user_id = f"anon_{client_ip}"

        cursor.execute(
            "INSERT INTO anonymous_comments (post_id, user_identifier, username, content, created_at) VALUES (%s, %s, %s, %s, NOW())",
            (post_id, anonymous_user_id, comment.username, comment.content),
        )
        connection.commit()

        # Update comment count in posts table
        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_comments WHERE post_id = %s", (post_id,)
        )
        comment_count = cursor.fetchone()[0]
        cursor.execute(
            "UPDATE posts SET comments_count = %s WHERE id = %s",
            (comment_count, post_id),
        )
        connection.commit()

    finally:
        cursor.close()
        connection.close()


@app.get("/api/posts/{post_id}/comments")
async def get_comments(post_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get anonymous comments
        query = """
        SELECT id, post_id, username, content, created_at, 'anonymous' as user_type
        FROM anonymous_comments 
        WHERE post_id = %s 
        ORDER BY created_at DESC
        """
        cursor.execute(query, (post_id,))
        comments = cursor.fetchall()
        return comments
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: int, user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if user owns the comment or is admin
        cursor.execute("SELECT user_id FROM comments WHERE id = %s", (comment_id,))
        comment = cursor.fetchone()

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if comment["user_id"] != user_id and not user["is_admin"]:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this comment"
            )

        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
        connection.commit()

    finally:
        cursor.close()
        connection.close()


@app.get("/api/posts/{post_id}", response_model=Post)
async def get_post(post_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM posts WHERE id = %s"
        cursor.execute(query, (post_id,))
        post = cursor.fetchone()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Parse media_urls JSON field
        import json

        if post.get("media_urls"):
            try:
                post["media_urls"] = json.loads(post["media_urls"])
            except (json.JSONDecodeError, TypeError):
                post["media_urls"] = None
        else:
            post["media_urls"] = None

        return post
    finally:
        cursor.close()
        connection.close()


@app.get("/api/portfolio", response_model=List[PortfolioItem])
async def get_portfolio():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM portfolio ORDER BY created_at DESC"
        cursor.execute(query)
        portfolio_items = cursor.fetchall()
        return portfolio_items
    finally:
        cursor.close()
        connection.close()


# Product API endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, limit: int = 20):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if category and category != "all":
            query = "SELECT * FROM products WHERE category = %s AND is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (category, limit))
        else:
            query = "SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (limit,))

        products = cursor.fetchall()

        # Fetch images for each product
        products_with_images = []
        for product in products:
            # Fetch images for this product, ordered by primary first
            cursor.execute(
                "SELECT id, image_url, is_primary FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
                (product["id"],),
            )
            images = cursor.fetchall()
            image_urls = [img["image_url"] for img in images] if images else []

            # Create product dict with images
            product_dict = dict(product)
            product_dict["image_urls"] = image_urls
            product_dict["images"] = [ProductImage(**img) for img in images]

            products_with_images.append(product_dict)

        return products_with_images
    finally:
        cursor.close()
        connection.close()


@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM products WHERE id = %s"
        cursor.execute(query, (product_id,))
        product_data = cursor.fetchone()

        if not product_data:
            raise HTTPException(status_code=404, detail="Product not found")

        # Fetch additional images for this product, ordered by primary first
        cursor.execute(
            "SELECT id, image_url, is_primary FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        image_urls = [img["image_url"] for img in images] if images else []

        # Construct the Product model instance
        product = Product(
            id=product_data["id"],
            name=product_data["name"],
            description=product_data["description"],
            category=product_data["category"],
            price=product_data["price"],
            stock=product_data["stock"],
            discount=product_data["discount"],
            specifications=product_data["specifications"],
            image_urls=image_urls,  # Use the fetched image_urls
            images=[ProductImage(**img) for img in images],  # Full image objects
            is_active=product_data["is_active"],
            created_at=product_data["created_at"],
            updated_at=product_data["updated_at"],
            created_by=product_data["created_by"],
        )

        # Add images array to the response for frontend gallery
        product_dict = product.dict()
        product_dict["images"] = images  # Include detailed image info

        return product_dict
    finally:
        cursor.close()
        connection.close()


@app.post("/api/products", response_model=dict)
async def create_product(
    product: ProductCreate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Validation: Check if at least one image is provided
        if not product.image_urls or len(product.image_urls) == 0:
            raise HTTPException(
                status_code=400, detail="At least one product image is required"
            )

        # Validate image URLs
        for i, url in enumerate(product.image_urls):
            if not url or not url.strip():
                raise HTTPException(
                    status_code=400,
                    detail=f"Image URL at position {i + 1} is empty or invalid",
                )

        # Start transaction
        connection.start_transaction()

        query = """
        INSERT INTO products (name, description, category, price, stock, discount, specifications, is_active, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                product.name,
                product.description,
                product.category,
                product.price,
                product.stock,
                product.discount,
                product.specifications,
                product.is_active,
                admin_id,
            ),
        )
        product_id = cursor.lastrowid

        # Insert images into product_images table
        image_records = []
        for i, url in enumerate(product.image_urls):
            # First image is primary, others are not
            is_primary = i == 0
            image_records.append((product_id, url, is_primary))

        cursor.executemany(
            """
            INSERT INTO product_images (product_id, image_url, is_primary, created_at)
            VALUES (%s, %s, %s, NOW())
            """,
            image_records,
        )

        # Commit transaction
        connection.commit()

        return {
            "message": "Product created successfully",
            "id": product_id,
            "images_saved": len(product.image_urls),
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        connection.rollback()
        raise
    except Exception as e:
        # Handle database errors
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create product: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.put("/api/products/{product_id}", response_model=dict)
async def update_product(
    product_id: int, product: ProductUpdate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Build dynamic update query
        update_fields = []
        update_values = []

        if product.name is not None:
            update_fields.append("name = %s")
            update_values.append(product.name)
        if product.description is not None:
            update_fields.append("description = %s")
            update_values.append(product.description)
        if product.category is not None:
            update_fields.append("category = %s")
            update_values.append(product.category)
        if product.price is not None:
            update_fields.append("price = %s")
            update_values.append(product.price)
        if product.stock is not None:
            update_fields.append("stock = %s")
            update_values.append(product.stock)
        if product.discount is not None:
            update_fields.append("discount = %s")
            update_values.append(product.discount)
        if product.specifications is not None:
            update_fields.append("specifications = %s")
            update_values.append(product.specifications)
        if product.image_url is not None:
            update_fields.append("image_url = %s")
            update_values.append(product.image_url)
        if product.is_active is not None:
            update_fields.append("is_active = %s")
            update_values.append(product.is_active)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = NOW()")
        update_values.append(product_id)

        query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.commit()
        return {"message": "Product updated successfully"}
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete related inquiries first
        cursor.execute(
            "DELETE FROM product_inquiries WHERE product_id = %s", (product_id,)
        )

        # Delete the product
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.commit()
        return {"message": "Product deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@app.post("/api/products/{product_id}/inquire")
async def create_product_inquiry(
    product_id: int, inquiry: ProductInquiry, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        query = """
        INSERT INTO product_inquiries (product_id, customer_name, customer_email, customer_phone, message, inquiry_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(
            query,
            (
                product_id,
                inquiry.customer_name,
                inquiry.customer_email,
                inquiry.customer_phone,
                inquiry.message,
                inquiry.inquiry_type,
            ),
        )
        connection.commit()

        return {"message": "Inquiry submitted successfully", "id": cursor.lastrowid}
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/product-inquiries")
async def get_product_inquiries(admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """
        SELECT pi.*, p.name as product_name, p.price as product_price
        FROM product_inquiries pi
        JOIN products p ON pi.product_id = p.id
        ORDER BY pi.created_at DESC
        """
        cursor.execute(query)
        inquiries = cursor.fetchall()
        return inquiries
    finally:
        cursor.close()
        connection.close()


@app.put("/api/admin/product-inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: int, status: str, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        valid_statuses = ["pending", "responded", "closed"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {valid_statuses}",
            )

        query = "UPDATE product_inquiries SET status = %s, responded_at = NOW() WHERE id = %s"
        cursor.execute(query, (status, inquiry_id))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")

        connection.commit()
        return {"message": "Inquiry status updated successfully"}
    finally:
        cursor.close()
        connection.close()


# Product Images API endpoints
@app.post("/api/products/{product_id}/images")
async def add_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Upload images
        uploaded_files = await upload_media(files, admin_id)

        # Prepare bulk insert
        image_records = [
            (product_id, f["url"], False)
            for f in uploaded_files["uploaded_files"]
            if f["type"] == "image"
        ]

        if image_records:
            cursor.executemany(
                """
                INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                VALUES (%s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE updated_at = NOW()
                """,
                image_records,
            )
            connection.commit()

            cursor.execute(
                """
                SELECT id, image_url, is_primary, created_at
                FROM product_images
                WHERE product_id = %s
                ORDER BY is_primary DESC, id DESC
                LIMIT %s
                """,
                (product_id, len(image_records)),
            )
            added_images = cursor.fetchall()
        else:
            added_images = []

        return {
            "message": f"Added {len(added_images)} images successfully",
            "images": added_images,
        }

    finally:
        cursor.close()
        connection.close()


@app.delete("/api/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT image_url FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        image = cursor.fetchone()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete from database
        cursor.execute("DELETE FROM product_images WHERE id = %s", (image_id,))
        connection.commit()

        return {"message": "Image deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@app.put("/api/products/{product_id}/images/{image_id}/primary")
async def set_primary_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT id FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Image not found")

        # Remove primary status from all images of this product
        cursor.execute(
            "UPDATE product_images SET is_primary = FALSE WHERE product_id = %s",
            (product_id,),
        )

        # Set this image as primary
        cursor.execute(
            "UPDATE product_images SET is_primary = TRUE WHERE id = %s", (image_id,)
        )

        connection.commit()
        return {"message": "Primary image updated successfully"}
    finally:
        cursor.close()
        connection.close()


@app.get("/api/products/{product_id}/images")
async def get_product_images(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, image_url, is_primary, created_at FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        return images
    finally:
        cursor.close()
        connection.close()


# Chat API endpoints
@app.post("/api/products/{product_id}/chat/sessions", response_model=dict)
async def create_chat_session(product_id: int, session_data: ChatSessionCreate):
    """Create a new chat session for a product"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Verify product exists
        cursor.execute("SELECT id, name FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Check if session already exists
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s",
            (session_data.session_id,),
        )
        existing_session = cursor.fetchone()

        if existing_session:
            return {
                "message": "Session already exists",
                "session_id": session_data.session_id,
                "existing": True,
            }

        # Create new chat session
        cursor.execute(
            """
            INSERT INTO product_chat_sessions 
            (product_id, session_id, customer_email, customer_name, status, priority)
            VALUES (%s, %s, %s, %s, 'active', 'medium')
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
                (session_id, sender_type, sender_name, message_text, message_type)
                VALUES (%s, 'customer', %s, %s, 'text')
            """,
                (
                    session_pk,
                    session_data.customer_name or "Customer",
                    session_data.initial_message,
                ),
            )

        connection.commit()

        # Send notifications for new inquiry
        try:
            inquiry_data = {
                "id": session_pk,
                "session_id": session_data.session_id,
                "customer_name": session_data.customer_name or "Anonymous",
                "customer_email": session_data.customer_email,
                "priority": "medium",
                "initial_message": session_data.initial_message or "",
            }
            product_data = {"id": product_id, "name": product["name"]}

            # Send notifications asynchronously
            asyncio.create_task(
                notification_service.notify_new_inquiry(inquiry_data, product_data)
            )
        except Exception as e:
            # Log notification error but don't fail the session creation
            logger.error(f"Failed to send new inquiry notifications: {e}")

        return {
            "message": "Chat session created successfully",
            "session_id": session_data.session_id,
            "product_name": product["name"],
            "existing": False,
        }

    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create chat session: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.get(
    "/api/products/{product_id}/chat/sessions/{session_id}/messages",
    response_model=List[ChatMessage],
)
async def get_chat_messages(product_id: int, session_id: str, limit: int = 50):
    """Get messages for a chat session with enhanced validation"""
    # Input validation
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if limit <= 0 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    try:
        # Validate session ID
        session_id = validate_session_id(session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Verify product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Get session info
        cursor.execute(
            """
            SELECT cs.id, cs.product_id, cs.status 
            FROM product_chat_sessions cs 
            WHERE cs.session_id = %s AND cs.product_id = %s
        """,
            (session_id, product_id),
        )

        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Get messages with proper ordering and limits
        cursor.execute(
            """
            SELECT id, session_id, sender_type, sender_id, sender_name, 
                   message_text, message_type, is_read, created_at, updated_at
            FROM product_chat_messages 
            WHERE session_id = %s 
            ORDER BY created_at ASC 
            LIMIT %s
        """,
            (session["id"], limit),
        )

        messages = cursor.fetchall()

        # Log message retrieval for monitoring
        if messages:
            print(f"Retrieved {len(messages)} messages for session {session_id}")

        return messages

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")
    finally:
        cursor.close()
        connection.close()


@app.post(
    "/api/products/{product_id}/chat/sessions/{session_id}/messages",
    response_model=dict,
)
async def send_chat_message(
    product_id: int, session_id: str, message_data: ChatMessageCreate, request: Request
):
    """Send a message in a chat session with enhanced validation and security"""
    # Input validation
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    client_ip = request.client.host

    try:
        # Validate and sanitize session ID
        session_id = validate_session_id(session_id)

        # Sanitize message text based on sender type
        if message_data.sender_type == "admin":
            sanitized_message = sanitize_admin_message(message_data.message_text)
        else:
            sanitized_message = sanitize_message_text(message_data.message_text)

            # Enhanced security validation for customer messages
            security_score = get_content_security_score(sanitized_message)
            if security_score < 0.5:
                logger.warning(
                    f"Low security score message from {client_ip}: {security_score}"
                )
                chat_rate_limiter.report_suspicious_activity(client_ip, session_id)
                raise HTTPException(
                    status_code=400,
                    detail="Message content flagged as potentially unsafe",
                )

            # Validate message content for security issues
            security_warnings = validate_message_content_security(sanitized_message)
            if security_warnings:
                logger.warning(
                    f"Security warnings for message from {client_ip}: {security_warnings}"
                )
                raise HTTPException(
                    status_code=400,
                    detail="Message contains potentially unsafe content",
                )

            # Rate limiting check
            allowed, retry_after, reason = chat_rate_limiter.check_message_rate_limit(
                client_ip, session_id, len(sanitized_message)
            )

            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded: {reason}",
                    headers={"Retry-After": str(retry_after)} if retry_after else {},
                )

            # Check for potential spam/abuse for customer messages
            if check_rate_limit_content(sanitized_message):
                chat_rate_limiter.report_suspicious_activity(client_ip, session_id)
                raise HTTPException(
                    status_code=429, detail="Message content flagged for review"
                )

        # Sanitize sender name if provided
        sanitized_sender_name = None
        if message_data.sender_name:
            sanitized_sender_name = sanitize_user_name(message_data.sender_name)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Get session info
        cursor.execute(
            """
            SELECT cs.id, cs.product_id, cs.status 
            FROM product_chat_sessions cs 
            WHERE cs.session_id = %s AND cs.product_id = %s
        """,
            (session_id, product_id),
        )

        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Check if session is closed
        if session["status"] == "closed":
            raise HTTPException(
                status_code=400, detail="Cannot send message to closed chat session"
            )

        # Insert message with sanitized content
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_name, message_text, message_type, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'text', NOW(), NOW())
        """,
            (
                session["id"],
                message_data.sender_type,
                sanitized_sender_name
                or ("Customer" if message_data.sender_type == "customer" else "Admin"),
                sanitized_message,
            ),
        )

        message_id = cursor.lastrowid

        # Update session last_message_at and status
        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET last_message_at = NOW(),
                updated_at = NOW(),
                status = CASE 
                    WHEN status = 'active' AND %s = 'customer' THEN 'pending'
                    WHEN status = 'pending' AND %s = 'admin' THEN 'in_progress'
                    ELSE status
                END
            WHERE id = %s
        """,
            (message_data.sender_type, message_data.sender_type, session["id"]),
        )

        connection.commit()

        # Check for urgent messages from customers and send notifications
        if message_data.sender_type == "customer":
            try:
                # Define urgent keywords
                urgent_keywords = [
                    "urgent",
                    "emergency",
                    "asap",
                    "immediately",
                    "critical",
                    "help",
                    "problem",
                    "issue",
                    "broken",
                    "not working",
                    "refund",
                    "cancel",
                    "complaint",
                    "disappointed",
                ]

                message_lower = sanitized_message.lower()
                is_urgent = any(keyword in message_lower for keyword in urgent_keywords)

                if is_urgent:
                    # Get session and product details for notification
                    cursor.execute(
                        """
                        SELECT cs.*, p.name as product_name, p.price as product_price
                        FROM product_chat_sessions cs
                        JOIN products p ON cs.product_id = p.id
                        WHERE cs.id = %s
                    """,
                        (session["id"],),
                    )
                    session_details = cursor.fetchone()

                    if session_details:
                        message_data_dict = {
                            "id": message_id,
                            "message_text": sanitized_message,
                        }
                        inquiry_data = {
                            "id": session_details["id"],
                            "session_id": session_details["session_id"],
                            "customer_name": session_details["customer_name"],
                            "customer_email": session_details["customer_email"],
                            "priority": session_details["priority"],
                        }
                        product_data = {
                            "id": session_details["product_id"],
                            "name": session_details["product_name"],
                            "price": session_details["product_price"],
                        }

                        # Send urgent message notifications asynchronously
                        asyncio.create_task(
                            notification_service.notify_urgent_message(
                                message_data_dict, inquiry_data, product_data
                            )
                        )
            except Exception as e:
                logger.error(f"Failed to send urgent message notifications: {e}")

        return {
            "message": "Message sent successfully",
            "message_id": message_id,
            "session_id": session_id,
            "sanitized": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
    finally:
        cursor.close()
        connection.close()


@app.put(
    "/api/products/{product_id}/chat/sessions/{session_id}/messages/read",
    response_model=dict,
)
async def mark_messages_read(
    product_id: int, session_id: str, message_ids: List[int] = None
):
    """Mark messages as read in a chat session with enhanced validation"""
    # Input validation
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    try:
        # Validate session ID
        session_id = validate_session_id(session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Validate message_ids if provided
    if message_ids is not None:
        if not isinstance(message_ids, list):
            raise HTTPException(status_code=400, detail="message_ids must be a list")

        if len(message_ids) > 100:
            raise HTTPException(
                status_code=400, detail="Cannot mark more than 100 messages at once"
            )

        # Validate all message IDs are positive integers
        for msg_id in message_ids:
            if not isinstance(msg_id, int) or msg_id <= 0:
                raise HTTPException(
                    status_code=400, detail="All message IDs must be positive integers"
                )

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        connection.start_transaction()

        # Verify product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Get session info
        cursor.execute(
            """
            SELECT cs.id 
            FROM product_chat_sessions cs 
            WHERE cs.session_id = %s AND cs.product_id = %s
        """,
            (session_id, product_id),
        )

        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Mark messages as read
        if message_ids:
            # Mark specific messages as read
            placeholders = ",".join(["%s"] * len(message_ids))
            cursor.execute(
                f"""
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s AND id IN ({placeholders})
            """,
                [session["id"]] + message_ids,
            )
        else:
            # Mark all messages in session as read
            cursor.execute(
                """
                UPDATE product_chat_messages 
                SET is_read = TRUE, updated_at = NOW()
                WHERE session_id = %s
            """,
                (session["id"],),
            )

        affected_rows = cursor.rowcount
        connection.commit()

        print(f"Marked {affected_rows} messages as read in session {session_id}")

        return {
            "message": f"Marked {affected_rows} messages as read",
            "affected_rows": affected_rows,
            "session_id": session_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to mark messages as read: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


# Admin chat management endpoints
@app.get("/api/admin/inquiries", response_model=List[ChatSession])
async def get_product_inquiries(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_admin_id: Optional[int] = None,
    product_id: Optional[int] = None,
    sort_by: str = "last_message_at",
    sort_order: str = "desc",
    limit: int = 50,
    offset: int = 0,
    admin_id: int = Depends(get_current_admin),
):
    """Get product inquiries with filtering and sorting for admin management"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Build WHERE clause with filters
        where_conditions = []
        params = []

        if status:
            where_conditions.append("cs.status = %s")
            params.append(status)

        if priority:
            where_conditions.append("cs.priority = %s")
            params.append(priority)

        if assigned_admin_id:
            where_conditions.append("cs.assigned_admin_id = %s")
            params.append(assigned_admin_id)

        if product_id:
            where_conditions.append("cs.product_id = %s")
            params.append(product_id)

        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)

        # Validate sort parameters
        valid_sort_fields = [
            "last_message_at",
            "created_at",
            "priority",
            "status",
            "product_name",
        ]
        valid_sort_orders = ["asc", "desc"]

        if sort_by not in valid_sort_fields:
            sort_by = "last_message_at"
        if sort_order not in valid_sort_orders:
            sort_order = "desc"

        # Build ORDER BY clause
        order_clause = f"ORDER BY {sort_by} {sort_order.upper()}"

        cursor.execute(
            f"""
            SELECT 
                cs.id, cs.product_id, cs.session_id, cs.customer_email, 
                cs.customer_name, cs.status, cs.priority, cs.created_at, 
                cs.updated_at, cs.last_message_at, cs.assigned_admin_id,
                p.name as product_name,
                p.price as product_price,
                u.username as assigned_admin_name,
                COUNT(cm.id) as total_messages,
                COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_messages,
                MAX(CASE WHEN cm.sender_type = 'customer' THEN cm.message_text END) as last_customer_message,
                MAX(CASE WHEN cm.sender_type = 'customer' THEN cm.created_at END) as last_customer_message_at
            FROM product_chat_sessions cs
            LEFT JOIN products p ON cs.product_id = p.id
            LEFT JOIN users u ON cs.assigned_admin_id = u.id
            LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
            {where_clause}
            GROUP BY cs.id, cs.product_id, cs.session_id, cs.customer_email, 
                     cs.customer_name, cs.status, cs.priority, cs.created_at, 
                     cs.updated_at, cs.last_message_at, cs.assigned_admin_id, 
                     p.name, p.price, u.username
            {order_clause}
            LIMIT %s OFFSET %s
        """,
            params + [limit, offset],
        )

        sessions = cursor.fetchall()

        # Get total count for pagination
        cursor.execute(
            f"""
            SELECT COUNT(DISTINCT cs.id) as total
            FROM product_chat_sessions cs
            LEFT JOIN products p ON cs.product_id = p.id
            LEFT JOIN users u ON cs.assigned_admin_id = u.id
            {where_clause}
        """,
            params,
        )

        total_count = cursor.fetchone()["total"]

        return {
            "inquiries": sessions,
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get product inquiries: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/chat/sessions", response_model=List[ChatSession])
async def get_admin_chat_sessions(
    status: Optional[str] = None,
    limit: int = 50,
    admin_id: int = Depends(get_current_admin),
):
    """Get chat sessions for admin management (legacy endpoint)"""
    # Redirect to the new inquiries endpoint
    return await get_product_inquiries(status=status, limit=limit, admin_id=admin_id)


@app.post("/api/admin/chat/sessions/{session_id}/respond", response_model=dict)
async def admin_respond_to_chat(
    session_id: str, response: AdminResponse, admin_id: int = Depends(get_current_admin)
):
    """Admin responds to a chat session"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get session info
        cursor.execute(
            """
            SELECT cs.id, cs.product_id, cs.status 
            FROM product_chat_sessions cs 
            WHERE cs.session_id = %s
        """,
            (session_id,),
        )

        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Insert admin response
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_id, sender_name, message_text, message_type)
            VALUES (%s, 'admin', %s, %s, %s, 'text')
        """,
            (
                session["id"],
                admin_id,
                response.admin_name or "Admin",
                response.message_text.strip(),
            ),
        )

        message_id = cursor.lastrowid

        # Update session status and assignment
        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET last_message_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP,
                status = 'in_progress',
                assigned_admin_id = %s
            WHERE id = %s
        """,
            (admin_id, session["id"]),
        )

        connection.commit()

        return {
            "message": "Response sent successfully",
            "message_id": message_id,
            "session_id": session_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to send response: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.put("/api/admin/inquiries/{inquiry_id}/status", response_model=dict)
async def update_inquiry_status(
    inquiry_id: int,
    status_update: InquiryStatusUpdate,
    admin_id: int = Depends(get_current_admin),
):
    """Update inquiry status and assignment"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Validate status
        valid_statuses = ["active", "pending", "in_progress", "resolved", "closed"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {valid_statuses}",
            )

        # Get current inquiry info
        cursor.execute(
            "SELECT id, session_id, status, assigned_admin_id FROM product_chat_sessions WHERE id = %s",
            (inquiry_id,),
        )
        inquiry = cursor.fetchone()

        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")

        # Update inquiry status and assignment
        assigned_admin = status_update.assigned_admin_id or (
            admin_id
            if status_update.status in ["in_progress", "resolved"]
            else inquiry["assigned_admin_id"]
        )

        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET status = %s, 
                updated_at = CURRENT_TIMESTAMP,
                assigned_admin_id = %s
            WHERE id = %s
        """,
            (status_update.status, assigned_admin, inquiry_id),
        )

        connection.commit()

        # Get admin name and email if assigned
        admin_name = None
        admin_email = None
        if assigned_admin:
            cursor.execute(
                "SELECT username, email FROM users WHERE id = %s", (assigned_admin,)
            )
            admin_result = cursor.fetchone()
            if admin_result:
                admin_name = admin_result["username"]
                admin_email = admin_result["email"]

        # Send assignment notification if admin was assigned and it's a new assignment
        if (
            assigned_admin
            and assigned_admin != inquiry["assigned_admin_id"]
            and status_update.status in ["in_progress"]
        ):
            try:
                # Get inquiry and product details for notification
                cursor.execute(
                    """
                    SELECT cs.*, p.name as product_name, p.price as product_price
                    FROM product_chat_sessions cs
                    JOIN products p ON cs.product_id = p.id
                    WHERE cs.id = %s
                """,
                    (inquiry_id,),
                )
                inquiry_details = cursor.fetchone()

                if inquiry_details:
                    inquiry_data = {
                        "id": inquiry_id,
                        "session_id": inquiry_details["session_id"],
                        "customer_name": inquiry_details["customer_name"],
                        "customer_email": inquiry_details["customer_email"],
                        "priority": inquiry_details["priority"],
                        "status": status_update.status,
                    }
                    product_data = {
                        "id": inquiry_details["product_id"],
                        "name": inquiry_details["product_name"],
                        "price": inquiry_details["product_price"],
                    }
                    admin_data = {
                        "id": assigned_admin,
                        "username": admin_name,
                        "email": admin_email,
                    }

                    # Send assignment notifications asynchronously
                    asyncio.create_task(
                        notification_service.notify_inquiry_assigned(
                            inquiry_data, product_data, admin_data
                        )
                    )
            except Exception as e:
                logger.error(f"Failed to send assignment notifications: {e}")

        return {
            "message": f"Inquiry status updated to {status_update.status}",
            "inquiry_id": inquiry_id,
            "status": status_update.status,
            "assigned_admin_id": assigned_admin,
            "assigned_admin_name": admin_name,
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update inquiry status: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/inquiries/{inquiry_id}/messages", response_model=List[ChatMessage])
async def get_inquiry_messages(
    inquiry_id: int, limit: int = 100, admin_id: int = Depends(get_current_admin)
):
    """Get messages for a specific inquiry"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Verify inquiry exists
        cursor.execute(
            "SELECT id, session_id FROM product_chat_sessions WHERE id = %s",
            (inquiry_id,),
        )
        inquiry = cursor.fetchone()

        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")

        # Get messages for the inquiry
        cursor.execute(
            """
            SELECT 
                cm.id, cm.session_id, cm.sender_type, cm.sender_id, 
                cm.sender_name, cm.message_text, cm.message_type, 
                cm.is_read, cm.created_at, cm.updated_at,
                u.username as admin_username
            FROM product_chat_messages cm
            LEFT JOIN users u ON cm.sender_id = u.id AND cm.sender_type = 'admin'
            WHERE cm.session_id = %s
            ORDER BY cm.created_at ASC
            LIMIT %s
        """,
            (inquiry["id"], limit),
        )

        messages = cursor.fetchall()

        # Update sender names for admin messages
        for message in messages:
            if message["sender_type"] == "admin" and message["admin_username"]:
                message["sender_name"] = message["admin_username"]

        return messages

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get inquiry messages: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.post("/api/admin/inquiries/{inquiry_id}/respond", response_model=dict)
async def respond_to_inquiry(
    inquiry_id: int, response: AdminResponse, admin_id: int = Depends(get_current_admin)
):
    """Admin responds to a product inquiry"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get inquiry info
        cursor.execute(
            """
            SELECT cs.id, cs.session_id, cs.product_id, cs.status 
            FROM product_chat_sessions cs 
            WHERE cs.id = %s
        """,
            (inquiry_id,),
        )

        inquiry = cursor.fetchone()
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")

        # Get admin info
        cursor.execute("SELECT username FROM users WHERE id = %s", (admin_id,))
        admin_info = cursor.fetchone()
        admin_name = admin_info["username"] if admin_info else "Admin"

        # Insert admin response
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_id, sender_name, message_text, message_type)
            VALUES (%s, 'admin', %s, %s, %s, 'text')
        """,
            (
                inquiry["id"],
                admin_id,
                admin_name,
                response.message_text.strip(),
            ),
        )

        message_id = cursor.lastrowid

        # Update inquiry status and assignment
        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET last_message_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP,
                status = CASE 
                    WHEN status = 'pending' THEN 'in_progress'
                    ELSE status
                END,
                assigned_admin_id = %s
            WHERE id = %s
        """,
            (admin_id, inquiry["id"]),
        )

        connection.commit()

        return {
            "message": "Response sent successfully",
            "message_id": message_id,
            "inquiry_id": inquiry_id,
            "admin_name": admin_name,
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to send response: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/inquiries/stats", response_model=dict)
async def get_inquiry_stats(admin_id: int = Depends(get_current_admin)):
    """Get inquiry statistics for admin dashboard"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get status counts
        cursor.execute(
            """
            SELECT 
                status,
                COUNT(*) as count
            FROM product_chat_sessions
            GROUP BY status
        """
        )
        status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}

        # Get priority counts
        cursor.execute(
            """
            SELECT 
                priority,
                COUNT(*) as count
            FROM product_chat_sessions
            GROUP BY priority
        """
        )
        priority_counts = {row["priority"]: row["count"] for row in cursor.fetchall()}

        # Get unread messages count
        cursor.execute(
            """
            SELECT COUNT(*) as unread_count
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cm.is_read = FALSE AND cm.sender_type = 'customer'
        """
        )
        unread_count = cursor.fetchone()["unread_count"]

        # Get today's new inquiries
        cursor.execute(
            """
            SELECT COUNT(*) as today_count
            FROM product_chat_sessions
            WHERE DATE(created_at) = CURDATE()
        """
        )
        today_count = cursor.fetchone()["today_count"]

        # Get pending inquiries that need immediate attention
        cursor.execute(
            """
            SELECT COUNT(*) as urgent_count
            FROM product_chat_sessions
            WHERE status = 'pending' AND priority IN ('high', 'urgent')
        """
        )
        urgent_count = cursor.fetchone()["urgent_count"]

        # Get inquiries assigned to current admin
        cursor.execute(
            """
            SELECT COUNT(*) as assigned_count
            FROM product_chat_sessions
            WHERE assigned_admin_id = %s AND status IN ('pending', 'in_progress')
        """,
            (admin_id,),
        )
        assigned_count = cursor.fetchone()["assigned_count"]

        return {
            "status_counts": status_counts,
            "priority_counts": priority_counts,
            "unread_messages": unread_count,
            "today_inquiries": today_count,
            "total_inquiries": sum(status_counts.values()),
            "urgent_inquiries": urgent_count,
            "assigned_to_me": assigned_count,
            "notification_settings": notification_service.get_notification_stats(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get inquiry stats: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/notifications/dashboard", response_model=dict)
async def get_admin_notification_dashboard(admin_id: int = Depends(get_current_admin)):
    """Get admin notification dashboard with pending items and alerts"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get pending inquiries with details
        cursor.execute(
            """
            SELECT 
                cs.id,
                cs.session_id,
                cs.product_id,
                p.name as product_name,
                cs.customer_name,
                cs.customer_email,
                cs.priority,
                cs.status,
                cs.created_at,
                cs.last_message_at,
                COUNT(cm.id) as message_count,
                COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_count
            FROM product_chat_sessions cs
            LEFT JOIN products p ON cs.product_id = p.id
            LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
            WHERE cs.status IN ('pending', 'in_progress')
            GROUP BY cs.id, cs.session_id, cs.product_id, p.name, cs.customer_name, 
                     cs.customer_email, cs.priority, cs.status, cs.created_at, cs.last_message_at
            ORDER BY 
                CASE cs.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    ELSE 4 
                END,
                cs.last_message_at DESC
            LIMIT 20
        """
        )
        pending_inquiries = cursor.fetchall()

        # Get recent unread messages
        cursor.execute(
            """
            SELECT 
                cm.id,
                cm.message_text,
                cm.sender_name,
                cm.created_at,
                cs.session_id,
                cs.product_id,
                p.name as product_name,
                cs.customer_name,
                cs.priority
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            JOIN products p ON cs.product_id = p.id
            WHERE cm.is_read = FALSE 
                AND cm.sender_type = 'customer'
                AND cs.status IN ('pending', 'in_progress')
            ORDER BY cm.created_at DESC
            LIMIT 10
        """
        )
        recent_messages = cursor.fetchall()

        # Get inquiries assigned to current admin
        cursor.execute(
            """
            SELECT 
                cs.id,
                cs.session_id,
                cs.product_id,
                p.name as product_name,
                cs.customer_name,
                cs.priority,
                cs.status,
                cs.last_message_at,
                COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_count
            FROM product_chat_sessions cs
            LEFT JOIN products p ON cs.product_id = p.id
            LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
            WHERE cs.assigned_admin_id = %s 
                AND cs.status IN ('pending', 'in_progress')
            GROUP BY cs.id, cs.session_id, cs.product_id, p.name, cs.customer_name, 
                     cs.priority, cs.status, cs.last_message_at
            ORDER BY cs.last_message_at DESC
            LIMIT 10
        """,
            (admin_id,),
        )
        my_inquiries = cursor.fetchall()

        return {
            "pending_inquiries": pending_inquiries,
            "recent_unread_messages": recent_messages,
            "my_assigned_inquiries": my_inquiries,
            "notification_stats": notification_service.get_notification_stats(),
            "last_updated": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get notification dashboard: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.post("/api/admin/notifications/test-email", response_model=dict)
async def test_email_notification(admin_id: int = Depends(get_current_admin)):
    """Test email notification system"""
    try:
        # Create test data
        inquiry_data = {
            "id": 999,
            "session_id": "test_session_123",
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "priority": "medium",
            "initial_message": "This is a test notification message.",
        }

        product_data = {
            "id": 1,
            "name": "Test Product",
            "price": 99.99,
            "category": "test",
        }

        # Send test notification
        success = (
            await notification_service.email_service.send_new_inquiry_notification(
                inquiry_data, product_data
            )
        )

        return {
            "message": (
                "Test email notification sent"
                if success
                else "Email notification failed"
            ),
            "success": success,
            "email_configured": notification_service.email_service.is_configured,
            "admin_emails_count": len(notification_service.email_service.admin_emails),
        }

    except Exception as e:
        logger.error(f"Failed to send test email: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to send test email: {str(e)}"
        )


@app.get("/api/admin/notifications/settings", response_model=dict)
async def get_notification_settings(admin_id: int = Depends(get_current_admin)):
    """Get current notification settings and status"""
    try:
        stats = notification_service.get_notification_stats()

        # Get admin email from database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT email FROM users WHERE id = %s", (admin_id,))
        admin = cursor.fetchone()
        admin_email = admin["email"] if admin else None

        cursor.close()
        connection.close()

        return {
            "notification_stats": stats,
            "admin_email": admin_email,
            "smtp_configured": bool(os.getenv("SMTP_USERNAME")),
            "admin_emails_env": (
                os.getenv("ADMIN_EMAILS", "").split(",")
                if os.getenv("ADMIN_EMAILS")
                else []
            ),
            "websocket_stats": websocket_manager.get_connection_stats(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get notification settings: {str(e)}"
        )


@app.put("/api/admin/chat/sessions/{session_id}/status", response_model=dict)
async def update_chat_session_status(
    session_id: str, status: str, admin_id: int = Depends(get_current_admin)
):
    """Update chat session status (legacy endpoint)"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get session ID
        cursor.execute(
            "SELECT id FROM product_chat_sessions WHERE session_id = %s", (session_id,)
        )
        session = cursor.fetchone()

        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Use the new inquiry status update
        status_update = InquiryStatusUpdate(status=status)
        return await update_inquiry_status(session["id"], status_update, admin_id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update session status: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


# WebSocket endpoints for real-time chat
@app.websocket("/ws/chat/customer/{product_id}/{session_id}")
async def websocket_customer_chat(
    websocket: WebSocket,
    product_id: int,
    session_id: str,
    customer_name: str = "Anonymous",
):
    """WebSocket endpoint for customer chat connections with enhanced security"""

    connection_id = f"customer_{session_id}_{uuid.uuid4().hex[:8]}"
    client_ip = websocket.client.host if hasattr(websocket, "client") else "unknown"

    try:
        # Validate and sanitize inputs first
        try:
            session_id = validate_session_id(session_id)
            customer_name = (
                sanitize_user_name(customer_name) if customer_name else "Anonymous"
            )
        except ValueError as e:
            logger.warning(f"Invalid WebSocket parameters from {client_ip}: {e}")
            await websocket.close(code=1003, reason="Invalid parameters")
            return

        # Rate limiting check for WebSocket connections (more permissive)
        try:
            allowed, retry_after, reason = (
                chat_rate_limiter.check_connection_rate_limit(client_ip)
            )
            if not allowed:
                logger.warning(
                    f"WebSocket rate limit exceeded for {client_ip}: {reason}"
                )
                await websocket.close(
                    code=1008,
                    reason=f"Too many connections. Please wait {retry_after} seconds.",
                )
                return
        except Exception as e:
            logger.error(f"Rate limiting error for WebSocket: {e}")
            # Continue with connection if rate limiting fails
            pass

        # Connect to WebSocket manager with IP address
        connection = await websocket_manager.connect(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=ConnectionType.CUSTOMER,
            session_id=session_id,
            product_id=product_id,
            user_name=customer_name,
            ip_address=client_ip,
        )

        # Handle incoming messages
        while True:
            try:
                # Receive message from WebSocket
                data = await websocket.receive_text()
                message_data = json.loads(data)

                # Handle the message through WebSocket manager
                await websocket_manager.handle_message(connection_id, message_data)

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                # Send error message for invalid JSON
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": "Invalid JSON format",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )
            except Exception as e:
                # Send error message for other exceptions
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

    except Exception as e:
        logger.error(f"WebSocket connection error for {client_ip}: {e}")
        # Try to send error message if connection is still open
        try:
            if websocket.client_state.name == "CONNECTED":
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "message": "Connection error occurred",
                            "code": "CONNECTION_ERROR",
                        }
                    )
                )
        except:
            pass
    finally:
        # Ensure cleanup on disconnect
        try:
            await websocket_manager.disconnect(connection_id)
        except Exception as cleanup_error:
            logger.error(f"Error during WebSocket cleanup: {cleanup_error}")


@app.websocket("/ws/admin/notifications/{admin_id}")
async def websocket_admin_notifications(
    websocket: WebSocket, admin_id: int, admin_name: str = "Admin"
):
    """WebSocket endpoint specifically for admin notifications"""
    connection_id = f"admin_notifications_{admin_id}_{datetime.utcnow().timestamp()}"

    try:
        # Connect to WebSocket manager
        connection = await websocket_manager.connect(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=ConnectionType.ADMIN,
            user_id=admin_id,
            user_name=admin_name,
        )

        # Send initial connection confirmation
        await connection.send_message(
            {
                "type": "notification_connection_established",
                "admin_id": admin_id,
                "admin_name": admin_name,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_json()

                # Handle different notification-related messages
                if data.get("type") == "get_pending_notifications":
                    # Send current pending notifications
                    await _send_pending_notifications(connection, admin_id)
                elif data.get("type") == "mark_notification_read":
                    # Handle notification read status
                    notification_id = data.get("notification_id")
                    if notification_id:
                        await _mark_notification_read(notification_id, admin_id)

            except Exception as e:
                logger.error(f"Error handling admin notification message: {e}")
                break

    except WebSocketDisconnect:
        logger.info(f"Admin notification WebSocket disconnected: {admin_id}")
    except Exception as e:
        logger.error(f"Admin notification WebSocket error: {e}")
    finally:
        await websocket_manager.disconnect(connection_id)


async def _send_pending_notifications(connection, admin_id: int):
    """Send pending notifications to admin via WebSocket"""
    try:
        # Get pending notifications from database
        db_connection = get_db_connection()
        cursor = db_connection.cursor(dictionary=True)

        # Get pending inquiries
        cursor.execute(
            """
            SELECT 
                cs.id,
                cs.session_id,
                cs.product_id,
                p.name as product_name,
                cs.customer_name,
                cs.priority,
                cs.status,
                cs.created_at,
                COUNT(CASE WHEN cm.is_read = FALSE AND cm.sender_type = 'customer' THEN 1 END) as unread_count
            FROM product_chat_sessions cs
            LEFT JOIN products p ON cs.product_id = p.id
            LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
            WHERE cs.status IN ('pending', 'in_progress')
                AND (cs.assigned_admin_id IS NULL OR cs.assigned_admin_id = %s)
            GROUP BY cs.id, cs.session_id, cs.product_id, p.name, cs.customer_name, 
                     cs.priority, cs.status, cs.created_at
            ORDER BY 
                CASE cs.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    ELSE 4 
                END,
                cs.created_at DESC
            LIMIT 10
        """,
            (admin_id,),
        )

        pending_notifications = cursor.fetchall()

        await connection.send_message(
            {
                "type": "pending_notifications",
                "notifications": pending_notifications,
                "count": len(pending_notifications),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        cursor.close()
        db_connection.close()

    except Exception as e:
        logger.error(f"Failed to send pending notifications: {e}")


async def _mark_notification_read(notification_id: str, admin_id: int):
    """Mark a notification as read"""
    try:
        # This could be implemented with a notifications table in the future
        # For now, we'll just log it
        logger.info(
            f"Notification {notification_id} marked as read by admin {admin_id}"
        )
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {e}")


@app.websocket("/ws/chat/admin/{admin_id}")
async def websocket_admin_chat(
    websocket: WebSocket, admin_id: int, admin_name: str = "Admin"
):
    """WebSocket endpoint for admin chat connections"""

    connection_id = f"admin_{admin_id}_{uuid.uuid4().hex[:8]}"

    try:
        # Connect to WebSocket manager
        connection = await websocket_manager.connect(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=ConnectionType.ADMIN,
            user_id=admin_id,
            user_name=admin_name,
        )

        # Handle incoming messages
        while True:
            try:
                # Receive message from WebSocket
                data = await websocket.receive_text()
                message_data = json.loads(data)

                # Handle the message through WebSocket manager
                await websocket_manager.handle_message(connection_id, message_data)

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                # Send error message for invalid JSON
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": "Invalid JSON format",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )
            except Exception as e:
                # Send error message for other exceptions
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

    except Exception as e:
        print(f"Admin WebSocket connection error: {e}")
    finally:
        # Ensure cleanup on disconnect
        await websocket_manager.disconnect(connection_id)


@app.websocket("/ws/chat/session/{session_id}")
async def websocket_session_chat(
    websocket: WebSocket,
    session_id: str,
    user_type: str = "customer",
    user_id: int = None,
    user_name: str = "Anonymous",
    product_id: int = None,
):
    """Generic WebSocket endpoint for session-based chat connections"""

    connection_type = (
        ConnectionType.ADMIN if user_type == "admin" else ConnectionType.CUSTOMER
    )
    connection_id = f"{user_type}_{session_id}_{uuid.uuid4().hex[:8]}"

    try:
        # Connect to WebSocket manager
        connection = await websocket_manager.connect(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=connection_type,
            session_id=session_id,
            product_id=product_id,
            user_id=user_id,
            user_name=user_name,
        )

        # Handle incoming messages
        while True:
            try:
                # Receive message from WebSocket
                data = await websocket.receive_text()
                message_data = json.loads(data)

                # Handle the message through WebSocket manager
                await websocket_manager.handle_message(connection_id, message_data)

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                # Send error message for invalid JSON
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": "Invalid JSON format",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )
            except Exception as e:
                # Send error message for other exceptions
                await connection.send_message(
                    {
                        "type": MessageType.ERROR.value,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

    except Exception as e:
        print(f"Session WebSocket connection error: {e}")
    finally:
        # Ensure cleanup on disconnect
        await websocket_manager.disconnect(connection_id)


# WebSocket management endpoints
@app.get("/api/websocket/stats")
async def get_websocket_stats(admin_id: int = Depends(get_current_admin)):
    """Get WebSocket connection statistics"""
    return websocket_manager.get_connection_stats()


@app.get("/api/websocket/sessions/{session_id}")
async def get_session_websocket_info(
    session_id: str, admin_id: int = Depends(get_current_admin)
):
    """Get WebSocket information for a specific session"""
    session_info = websocket_manager.get_session_info(session_id)
    if not session_info:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_info


@app.post("/api/websocket/broadcast/session/{session_id}")
async def broadcast_to_session(
    session_id: str, message: dict, admin_id: int = Depends(get_current_admin)
):
    """Broadcast a message to all connections in a session"""
    await websocket_manager.broadcast_to_session(session_id, message)
    return {"message": "Message broadcasted successfully"}


@app.post("/api/websocket/broadcast/admins")
async def broadcast_to_admins(
    message: dict, admin_id: int = Depends(get_current_admin)
):
    """Broadcast a message to all admin connections"""
    await websocket_manager.broadcast_to_admins(message)
    return {"message": "Message broadcasted to admins successfully"}


# Start background cleanup task
@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup"""
    from websocket_manager import cleanup_task

    asyncio.create_task(cleanup_task())


# Enhanced chat message endpoint with WebSocket integration
@app.post(
    "/api/products/{product_id}/chat/sessions/{session_id}/messages/websocket",
    response_model=dict,
)
async def send_chat_message_with_websocket(
    product_id: int, session_id: str, message_data: ChatMessageCreate
):
    """Send a message in a chat session and broadcast via WebSocket"""

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Verify session exists
        cursor.execute(
            """
            SELECT cs.id, cs.product_id, cs.status 
            FROM product_chat_sessions cs 
            WHERE cs.session_id = %s AND cs.product_id = %s
        """,
            (session_id, product_id),
        )
        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Validate message
        if not message_data.message_text.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Insert message into database
        cursor.execute(
            """
            INSERT INTO product_chat_messages 
            (session_id, sender_type, sender_name, message_text, message_type)
            VALUES (%s, %s, %s, %s, 'text')
        """,
            (
                session["id"],
                message_data.sender_type,
                message_data.sender_name,
                message_data.message_text,
            ),
        )
        message_id = cursor.lastrowid

        # Update session last message time
        cursor.execute(
            """
            UPDATE product_chat_sessions 
            SET last_message_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP,
                status = CASE 
                    WHEN status = 'pending' THEN 'active'
                    ELSE status 
                END
            WHERE id = %s
        """,
            (session["id"],),
        )

        connection.commit()

        # Broadcast message via WebSocket
        websocket_message = {
            "type": MessageType.CHAT_MESSAGE.value,
            "message_id": message_id,
            "session_id": session_id,
            "product_id": product_id,
            "message": message_data.message_text,
            "sender_type": message_data.sender_type,
            "sender_name": message_data.sender_name,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await websocket_manager.broadcast_to_session(session_id, websocket_message)

        return {
            "message": "Message sent successfully",
            "message_id": message_id,
            "session_id": session_id,
            "broadcasted": True,
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
    finally:
        cursor.close()
        connection.close()
