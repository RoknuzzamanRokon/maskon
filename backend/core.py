from datetime import datetime, timedelta
import logging
import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from mysql.connector import Error
import mysql.connector
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional
import jwt

from websocket_manager import websocket_manager, ConnectionType, MessageType

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

    class MockDatabaseOptimizer:
        def analyze_query_performance(self):
            raise RuntimeError("Database performance analysis not available")

        def optimize_chat_indexes(self):
            raise RuntimeError("Database optimization not available")

        def cleanup_old_data(self, *args, **kwargs):
            raise RuntimeError("Database cleanup not available")

    db_optimizer = MockDatabaseOptimizer()


load_dotenv()

logger = logging.getLogger(__name__)

STATIC_DIR = "static"

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


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
