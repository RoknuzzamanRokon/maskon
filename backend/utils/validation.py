"""
Enhanced validation utilities for chat functionality
Provides comprehensive input validation, sanitization, and error handling
"""

import re
import html
import logging
from typing import Optional, List, Dict, Any, Union
from fastapi import HTTPException, status
from datetime import datetime
import bleach

logger = logging.getLogger(__name__)

# Allowed HTML tags for message content (very restrictive)
ALLOWED_TAGS = ["b", "i", "em", "strong", "u"]
ALLOWED_ATTRIBUTES = {}


class ValidationError(Exception):
    """Custom validation error"""

    def __init__(self, message: str, code: str = None, field: str = None):
        self.message = message
        self.code = code
        self.field = field
        super().__init__(message)


def validate_product_id(product_id: Union[int, str]) -> int:
    """Validate and convert product ID"""
    try:
        product_id = int(product_id)
        if product_id <= 0:
            raise ValidationError(
                "Product ID must be a positive integer",
                code="INVALID_PRODUCT_ID",
                field="product_id",
            )
        return product_id
    except (ValueError, TypeError):
        raise ValidationError(
            "Product ID must be a valid integer",
            code="INVALID_PRODUCT_ID",
            field="product_id",
        )


def validate_session_id(session_id: str) -> str:
    """Validate session ID"""
    if not session_id or not isinstance(session_id, str):
        raise ValidationError(
            "Session ID is required", code="MISSING_SESSION_ID", field="session_id"
        )

    session_id = session_id.strip()
    if not session_id:
        raise ValidationError(
            "Session ID cannot be empty", code="EMPTY_SESSION_ID", field="session_id"
        )

    if len(session_id) > 255:
        raise ValidationError(
            "Session ID cannot exceed 255 characters",
            code="SESSION_ID_TOO_LONG",
            field="session_id",
        )

    # Check for valid characters (alphanumeric, hyphens, underscores)
    if not re.match(r"^[a-zA-Z0-9_-]+$", session_id):
        raise ValidationError(
            "Session ID contains invalid characters",
            code="INVALID_SESSION_ID_FORMAT",
            field="session_id",
        )

    return session_id


def validate_message_text(message_text: str, max_length: int = 2000) -> str:
    """Validate and sanitize message text"""
    if not message_text or not isinstance(message_text, str):
        raise ValidationError(
            "Message text is required",
            code="MISSING_MESSAGE_TEXT",
            field="message_text",
        )

    # Remove leading/trailing whitespace
    message_text = message_text.strip()

    if not message_text:
        raise ValidationError(
            "Message text cannot be empty",
            code="EMPTY_MESSAGE_TEXT",
            field="message_text",
        )

    if len(message_text) > max_length:
        raise ValidationError(
            f"Message text cannot exceed {max_length} characters",
            code="MESSAGE_TOO_LONG",
            field="message_text",
        )

    # Sanitize HTML content
    message_text = sanitize_html(message_text)

    # Check for spam patterns
    if is_spam_message(message_text):
        raise ValidationError(
            "Message appears to be spam", code="SPAM_DETECTED", field="message_text"
        )

    return message_text


def validate_email(email: Optional[str]) -> Optional[str]:
    """Validate email address"""
    if not email:
        return None

    if not isinstance(email, str):
        raise ValidationError(
            "Email must be a string", code="INVALID_EMAIL_TYPE", field="email"
        )

    email = email.strip().lower()

    if not email:
        return None

    # Basic email validation
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(email_pattern, email):
        raise ValidationError(
            "Invalid email format", code="INVALID_EMAIL_FORMAT", field="email"
        )

    if len(email) > 254:  # RFC 5321 limit
        raise ValidationError(
            "Email address is too long", code="EMAIL_TOO_LONG", field="email"
        )

    return email


def validate_customer_name(name: Optional[str]) -> Optional[str]:
    """Validate customer name"""
    if not name:
        return None

    if not isinstance(name, str):
        raise ValidationError(
            "Name must be a string", code="INVALID_NAME_TYPE", field="name"
        )

    name = name.strip()

    if not name:
        return None

    if len(name) > 255:
        raise ValidationError(
            "Name cannot exceed 255 characters", code="NAME_TOO_LONG", field="name"
        )

    # Remove potentially dangerous characters
    name = sanitize_text(name)

    # Check for valid name characters (letters, spaces, hyphens, apostrophes)
    if not re.match(r"^[a-zA-Z\s\-'\.]+$", name):
        raise ValidationError(
            "Name contains invalid characters", code="INVALID_NAME_FORMAT", field="name"
        )

    return name


def validate_pagination(limit: int, offset: int) -> tuple[int, int]:
    """Validate pagination parameters"""
    try:
        limit = int(limit)
        offset = int(offset)
    except (ValueError, TypeError):
        raise ValidationError(
            "Pagination parameters must be integers", code="INVALID_PAGINATION_TYPE"
        )

    if limit <= 0:
        raise ValidationError(
            "Limit must be greater than 0", code="INVALID_LIMIT", field="limit"
        )

    if limit > 100:
        raise ValidationError(
            "Limit cannot exceed 100", code="LIMIT_TOO_LARGE", field="limit"
        )

    if offset < 0:
        raise ValidationError(
            "Offset must be non-negative", code="INVALID_OFFSET", field="offset"
        )

    return limit, offset


def sanitize_html(text: str) -> str:
    """Sanitize HTML content to prevent XSS"""
    if not text:
        return text

    # Use bleach to clean HTML
    cleaned = bleach.clean(
        text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True
    )

    # Additional XSS prevention
    cleaned = html.escape(cleaned, quote=False)

    # Remove any remaining script tags or javascript
    cleaned = re.sub(
        r"<script[^>]*>.*?</script>", "", cleaned, flags=re.IGNORECASE | re.DOTALL
    )
    cleaned = re.sub(r"javascript:", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"on\w+\s*=", "", cleaned, flags=re.IGNORECASE)

    return cleaned


def sanitize_text(text: str) -> str:
    """Sanitize plain text content"""
    if not text:
        return text

    # HTML escape
    text = html.escape(text)

    # Remove control characters except newlines and tabs
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

    return text


def is_spam_message(text: str) -> bool:
    """Basic spam detection"""
    if not text:
        return False

    text_lower = text.lower()

    # Check for excessive repetition
    if len(set(text_lower)) < len(text_lower) * 0.3:  # Less than 30% unique characters
        return True

    # Check for excessive caps
    if len(re.findall(r"[A-Z]", text)) > len(text) * 0.7:  # More than 70% caps
        return True

    # Check for spam keywords
    spam_keywords = [
        "buy now",
        "click here",
        "free money",
        "make money fast",
        "viagra",
        "casino",
        "lottery",
        "winner",
        "congratulations",
        "urgent",
        "act now",
        "limited time",
    ]

    for keyword in spam_keywords:
        if keyword in text_lower:
            return True

    # Check for excessive URLs
    url_count = len(
        re.findall(
            r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
            text,
        )
    )
    if url_count > 2:  # More than 2 URLs
        return True

    return False


def validate_message_type(message_type: str) -> str:
    """Validate message type"""
    valid_types = ["text", "system", "image", "file"]

    if not message_type or not isinstance(message_type, str):
        return "text"  # Default to text

    message_type = message_type.lower().strip()

    if message_type not in valid_types:
        raise ValidationError(
            f"Invalid message type. Must be one of: {', '.join(valid_types)}",
            code="INVALID_MESSAGE_TYPE",
            field="message_type",
        )

    return message_type


def validate_sender_type(sender_type: str) -> str:
    """Validate sender type"""
    valid_types = ["customer", "admin", "system"]

    if not sender_type or not isinstance(sender_type, str):
        raise ValidationError(
            "Sender type is required", code="MISSING_SENDER_TYPE", field="sender_type"
        )

    sender_type = sender_type.lower().strip()

    if sender_type not in valid_types:
        raise ValidationError(
            f"Invalid sender type. Must be one of: {', '.join(valid_types)}",
            code="INVALID_SENDER_TYPE",
            field="sender_type",
        )

    return sender_type


def validate_inquiry_status(status: str) -> str:
    """Validate inquiry status"""
    valid_statuses = ["active", "pending", "in_progress", "resolved", "closed"]

    if not status or not isinstance(status, str):
        raise ValidationError(
            "Status is required", code="MISSING_STATUS", field="status"
        )

    status = status.lower().strip()

    if status not in valid_statuses:
        raise ValidationError(
            f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            code="INVALID_STATUS",
            field="status",
        )

    return status


def validate_priority(priority: str) -> str:
    """Validate priority level"""
    valid_priorities = ["low", "medium", "high"]

    if not priority or not isinstance(priority, str):
        return "medium"  # Default to medium

    priority = priority.lower().strip()

    if priority not in valid_priorities:
        raise ValidationError(
            f"Invalid priority. Must be one of: {', '.join(valid_priorities)}",
            code="INVALID_PRIORITY",
            field="priority",
        )

    return priority


def create_validation_error_response(error: ValidationError) -> HTTPException:
    """Create HTTP exception from validation error"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "error": "Validation error",
            "message": error.message,
            "code": error.code,
            "field": error.field,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


def validate_request_data(
    data: Dict[str, Any], required_fields: List[str]
) -> Dict[str, Any]:
    """Validate request data structure"""
    if not isinstance(data, dict):
        raise ValidationError(
            "Request data must be a JSON object", code="INVALID_REQUEST_FORMAT"
        )

    # Check for required fields
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)

    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            code="MISSING_REQUIRED_FIELDS",
        )

    return data


# Rate limiting helpers
def validate_rate_limit_key(key: str) -> str:
    """Validate rate limit key"""
    if not key or not isinstance(key, str):
        raise ValidationError(
            "Rate limit key is required", code="MISSING_RATE_LIMIT_KEY"
        )

    # Sanitize key to prevent injection
    key = re.sub(r"[^a-zA-Z0-9_.-]", "", key)

    if len(key) > 100:
        key = key[:100]

    return key


def log_validation_error(error: ValidationError, context: Dict[str, Any] = None):
    """Log validation error for monitoring"""
    log_data = {
        "error_type": "validation_error",
        "message": error.message,
        "code": error.code,
        "field": error.field,
        "timestamp": datetime.utcnow().isoformat(),
    }

    if context:
        log_data["context"] = context

    logger.warning(f"Validation error: {log_data}")
