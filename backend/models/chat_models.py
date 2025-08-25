"""
Enhanced Pydantic models for product chat functionality
Implements proper validation and sanitization for chat messages
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
import html
import re


class MessageCreate(BaseModel):
    """Model for creating new chat messages with validation and sanitization"""

    message_text: str = Field(
        ..., min_length=1, max_length=2000, description="Message content"
    )
    sender_type: Literal["customer", "admin"] = Field(..., description="Type of sender")
    session_id: Optional[str] = Field(
        None, description="Session ID for anonymous users"
    )
    customer_email: Optional[str] = Field(None, description="Optional customer email")

    @validator("message_text")
    def sanitize_message_text(cls, v):
        """Sanitize message text to prevent XSS attacks"""
        if not v or not v.strip():
            raise ValueError("Message text cannot be empty")

        # Remove potentially dangerous HTML tags and scripts
        # Allow basic formatting but escape everything else
        v = html.escape(v.strip())

        # Remove any remaining script tags or javascript
        v = re.sub(r"<script[^>]*>.*?</script>", "", v, flags=re.IGNORECASE | re.DOTALL)
        v = re.sub(r"javascript:", "", v, flags=re.IGNORECASE)
        v = re.sub(r"on\w+\s*=", "", v, flags=re.IGNORECASE)

        return v

    @validator("customer_email")
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v is not None and v.strip():
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, v.strip()):
                raise ValueError("Invalid email format")
            return v.strip().lower()
        return v


class ProductMessage(BaseModel):
    """Model for product chat messages"""

    id: int
    session_id: int
    sender_type: str
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    message_text: str
    message_type: str = "text"
    is_read: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None


class ProductInquiry(BaseModel):
    """Model for product chat inquiries/sessions"""

    id: int
    product_id: int
    session_id: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    status: str
    priority: str = "medium"
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None
    assigned_admin_id: Optional[int] = None
    product_name: Optional[str] = None
    total_messages: int = 0
    unread_messages: int = 0


class AdminResponse(BaseModel):
    """Model for admin responses to customer inquiries"""

    message_text: str = Field(..., min_length=1, max_length=2000)
    admin_id: int
    admin_name: Optional[str] = None

    @validator("message_text")
    def sanitize_admin_message(cls, v):
        """Sanitize admin message text"""
        if not v or not v.strip():
            raise ValueError("Admin message cannot be empty")

        # Basic HTML escaping for admin messages
        # Admins might need some formatting, but still prevent XSS
        v = html.escape(v.strip())
        return v


class MessageFilter(BaseModel):
    """Model for filtering messages"""

    session_id: Optional[str] = None
    sender_type: Optional[Literal["customer", "admin", "system"]] = None
    is_read: Optional[bool] = None
    limit: int = Field(50, ge=1, le=100, description="Number of messages to retrieve")
    offset: int = Field(0, ge=0, description="Number of messages to skip")


class InquiryStatusUpdate(BaseModel):
    """Model for updating inquiry status"""

    status: Literal["active", "pending", "in_progress", "resolved", "closed"]
    assigned_admin_id: Optional[int] = None
    priority: Optional[Literal["low", "medium", "high"]] = None


class ChatSessionCreate(BaseModel):
    """Model for creating new chat sessions"""

    product_id: int = Field(..., gt=0, description="Product ID")
    session_id: str = Field(
        ..., min_length=1, max_length=255, description="Unique session identifier"
    )
    customer_email: Optional[str] = Field(None, description="Optional customer email")
    customer_name: Optional[str] = Field(
        None, max_length=255, description="Optional customer name"
    )
    initial_message: Optional[str] = Field(
        None, max_length=2000, description="Initial message"
    )

    @validator("customer_email")
    def validate_customer_email(cls, v):
        """Validate customer email format"""
        if v is not None and v.strip():
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, v.strip()):
                raise ValueError("Invalid email format")
            return v.strip().lower()
        return v

    @validator("customer_name")
    def sanitize_customer_name(cls, v):
        """Sanitize customer name"""
        if v is not None and v.strip():
            # Remove HTML and potentially dangerous characters
            v = html.escape(v.strip())
            # Remove any non-printable characters
            v = re.sub(r"[^\w\s\-\.]", "", v)
            return v[:255]  # Ensure max length
        return v

    @validator("initial_message")
    def sanitize_initial_message(cls, v):
        """Sanitize initial message"""
        if v is not None and v.strip():
            v = html.escape(v.strip())
            # Remove script tags and javascript
            v = re.sub(
                r"<script[^>]*>.*?</script>", "", v, flags=re.IGNORECASE | re.DOTALL
            )
            v = re.sub(r"javascript:", "", v, flags=re.IGNORECASE)
            return v
        return v


class MessageReadUpdate(BaseModel):
    """Model for marking messages as read"""

    message_ids: Optional[List[int]] = Field(
        None, description="Specific message IDs to mark as read"
    )
    mark_all: bool = Field(False, description="Mark all messages in session as read")
