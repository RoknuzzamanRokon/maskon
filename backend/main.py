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
        # Azure MySQL connection with SSL
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            ssl_disabled=False,
            port=3306,
            autocommit=True,
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


class PortfolioCreate(BaseModel):
    title: str
    description: str
    technologies: str
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None


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
            "SELECT id, username, email, is_admin FROM users WHERE id = %s",
            (user_id,),
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
            "SELECT id, username, email, is_admin FROM users WHERE id = %s",
            (user_id,),
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


@app.post("/api/portfolio", response_model=dict)
async def create_portfolio_item(
    portfolio: PortfolioCreate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
        INSERT INTO portfolio (title, description, technologies, project_url, github_url, image_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                portfolio.title,
                portfolio.description,
                portfolio.technologies,
                portfolio.project_url,
                portfolio.github_url,
                portfolio.image_url,
            ),
        )
        connection.commit()
        portfolio_id = cursor.lastrowid

        return {"message": "Portfolio item created successfully", "id": portfolio_id}
    finally:
        cursor.close()
        connection.close()


@app.put("/api/portfolio/{portfolio_id}", response_model=dict)
async def update_portfolio_item(
    portfolio_id: int,
    portfolio: PortfolioUpdate,
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Build dynamic update query based on provided fields
        update_fields = []
        update_values = []

        if portfolio.title is not None:
            update_fields.append("title = %s")
            update_values.append(portfolio.title)
        if portfolio.description is not None:
            update_fields.append("description = %s")
            update_values.append(portfolio.description)
        if portfolio.technologies is not None:
            update_fields.append("technologies = %s")
            update_values.append(portfolio.technologies)
        if portfolio.project_url is not None:
            update_fields.append("project_url = %s")
            update_values.append(portfolio.project_url)
        if portfolio.github_url is not None:
            update_fields.append("github_url = %s")
            update_values.append(portfolio.github_url)
        if portfolio.image_url is not None:
            update_fields.append("image_url = %s")
            update_values.append(portfolio.image_url)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = NOW()")
        update_values.append(portfolio_id)

        query = f"UPDATE portfolio SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Portfolio item not found")

        connection.commit()
        return {"message": "Portfolio item updated successfully"}
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/portfolio/{portfolio_id}")
async def delete_portfolio_item(
    portfolio_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM portfolio WHERE id = %s", (portfolio_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Portfolio item not found")

        connection.commit()
        return {"message": "Portfolio item deleted successfully"}
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


# Admin Notifications endpoint
@app.get("/api/admin/notifications")
async def get_admin_notifications(admin_id: int = Depends(get_current_admin)):
    """Get admin notifications including unread messages, system alerts, and activity summaries"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        notifications = []

        # Get unread chat messages count
        cursor.execute(
            """
            SELECT COUNT(*) as unread_count 
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cm.sender_type = 'customer' AND cm.is_read = FALSE
        """
        )
        unread_messages = cursor.fetchone()

        if unread_messages and unread_messages["unread_count"] > 0:
            notifications.append(
                {
                    "id": "unread_messages",
                    "type": "chat",
                    "title": "Unread Messages",
                    "message": f"You have {unread_messages['unread_count']} unread customer messages",
                    "count": unread_messages["unread_count"],
                    "priority": (
                        "high" if unread_messages["unread_count"] > 10 else "medium"
                    ),
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/chat",
                }
            )

        # Get pending product inquiries
        cursor.execute(
            """
            SELECT COUNT(*) as pending_count 
            FROM product_inquiries 
            WHERE status = 'pending'
        """
        )
        pending_inquiries = cursor.fetchone()

        if pending_inquiries and pending_inquiries["pending_count"] > 0:
            notifications.append(
                {
                    "id": "pending_inquiries",
                    "type": "inquiry",
                    "title": "Pending Inquiries",
                    "message": f"{pending_inquiries['pending_count']} product inquiries need attention",
                    "count": pending_inquiries["pending_count"],
                    "priority": "medium",
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/inquiries",
                }
            )

        # Get recent system activity (last 24 hours)
        cursor.execute(
            """
            SELECT COUNT(*) as new_sessions 
            FROM product_chat_sessions 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        """
        )
        new_sessions = cursor.fetchone()

        if new_sessions and new_sessions["new_sessions"] > 0:
            notifications.append(
                {
                    "id": "new_sessions",
                    "type": "activity",
                    "title": "New Chat Sessions",
                    "message": f"{new_sessions['new_sessions']} new chat sessions started today",
                    "count": new_sessions["new_sessions"],
                    "priority": "low",
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/chat",
                }
            )

        return {
            "notifications": notifications,
            "total_count": len(notifications),
            "unread_count": sum(
                1 for n in notifications if n["priority"] in ["high", "medium"]
            ),
            "last_updated": datetime.utcnow(),
        }

    except Exception as e:
        logger.error(f"Error fetching admin notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")
    finally:
        cursor.close()
        connection.close()


# Admin Settings endpoint
@app.get("/api/admin/settings")
async def get_admin_settings(admin_id: int = Depends(get_current_admin)):
    """Get admin settings and system configuration"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get admin user info
        cursor.execute(
            """
            SELECT id, username, email, is_admin, created_at
            FROM users 
            WHERE id = %s
        """,
            (admin_id,),
        )
        admin_info = cursor.fetchone()

        # Get system statistics
        cursor.execute("SELECT COUNT(*) as total_posts FROM posts")
        posts_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_products FROM products")
        products_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_sessions FROM product_chat_sessions")
        sessions_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_messages FROM product_chat_messages")
        messages_count = cursor.fetchone()

        # Get recent activity stats
        cursor.execute(
            """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM product_chat_sessions 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """
        )
        recent_activity = cursor.fetchall()

        settings = {
            "admin_info": admin_info,
            "system_stats": {
                "total_posts": posts_count["total_posts"] if posts_count else 0,
                "total_products": (
                    products_count["total_products"] if products_count else 0
                ),
                "total_chat_sessions": (
                    sessions_count["total_sessions"] if sessions_count else 0
                ),
                "total_messages": (
                    messages_count["total_messages"] if messages_count else 0
                ),
            },
            "recent_activity": recent_activity,
            "system_config": {
                "chat_enabled": True,
                "file_uploads_enabled": True,
                "max_file_size_mb": 50,
                "supported_file_types": [
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                    "video/mp4",
                    "video/webm",
                ],
                "rate_limiting_enabled": True,
                "websocket_enabled": True,
            },
            "security_settings": {
                "session_timeout_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
                "max_login_attempts": 5,
                "password_min_length": 8,
                "require_admin_approval": True,
            },
            "last_updated": datetime.utcnow(),
        }

        return settings

    except Exception as e:
        logger.error(f"Error fetching admin settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin settings")
    finally:
        cursor.close()
        connection.close()


@app.put("/api/admin/settings")
async def update_admin_settings(
    settings_update: dict, admin_id: int = Depends(get_current_admin)
):
    """Update admin settings (limited to safe configuration options)"""
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Only allow updating specific safe settings
        allowed_updates = ["email", "notification_preferences"]

        if "email" in settings_update and "email" in allowed_updates:
            # Update admin email
            new_email = settings_update["email"]
            if not new_email or "@" not in new_email:
                raise HTTPException(status_code=400, detail="Invalid email format")

            cursor.execute(
                """
                UPDATE users 
                SET email = %s 
                WHERE id = %s
            """,
                (new_email, admin_id),
            )

        connection.commit()

        return {
            "message": "Settings updated successfully",
            "updated_at": datetime.utcnow(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating admin settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
