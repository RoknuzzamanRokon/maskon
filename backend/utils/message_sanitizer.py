"""
Message sanitization utilities for chat functionality
Provides comprehensive XSS protection and content validation
"""

import html
import re
import bleach
import urllib.parse
from typing import Optional, List
import logging
import unicodedata

logger = logging.getLogger(__name__)

# Allowed HTML tags for basic formatting (if needed in the future)
ALLOWED_TAGS = []  # Currently no HTML tags allowed
ALLOWED_ATTRIBUTES = {}

# Comprehensive patterns for dangerous content
SCRIPT_PATTERN = re.compile(r"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
JAVASCRIPT_PATTERN = re.compile(r"javascript:", re.IGNORECASE)
EVENT_HANDLER_PATTERN = re.compile(r"on\w+\s*=", re.IGNORECASE)
DATA_URL_PATTERN = re.compile(r"data:\s*[^;]*;base64", re.IGNORECASE)

# Additional XSS patterns
VBSCRIPT_PATTERN = re.compile(r"vbscript:", re.IGNORECASE)
EXPRESSION_PATTERN = re.compile(r"expression\s*\(", re.IGNORECASE)
IMPORT_PATTERN = re.compile(r"@import", re.IGNORECASE)
STYLE_PATTERN = re.compile(r"<style[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
IFRAME_PATTERN = re.compile(r"<iframe[^>]*>.*?</iframe>", re.IGNORECASE | re.DOTALL)
OBJECT_PATTERN = re.compile(r"<object[^>]*>.*?</object>", re.IGNORECASE | re.DOTALL)
EMBED_PATTERN = re.compile(r"<embed[^>]*>", re.IGNORECASE)
FORM_PATTERN = re.compile(r"<form[^>]*>.*?</form>", re.IGNORECASE | re.DOTALL)

# URL patterns for link detection and validation
URL_PATTERN = re.compile(
    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
    re.IGNORECASE,
)

# Unicode control characters that could be used for attacks
CONTROL_CHARS = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]")

# SQL injection patterns
SQL_INJECTION_PATTERNS = [
    re.compile(r"(union\s+select)", re.IGNORECASE),
    re.compile(r"(drop\s+table)", re.IGNORECASE),
    re.compile(r"(insert\s+into)", re.IGNORECASE),
    re.compile(r"(delete\s+from)", re.IGNORECASE),
    re.compile(r"(update\s+\w+\s+set)", re.IGNORECASE),
    re.compile(r"(exec\s*\()", re.IGNORECASE),
    re.compile(r"(script\s*:)", re.IGNORECASE),
]

# Command injection patterns
COMMAND_INJECTION_PATTERNS = [
    re.compile(r"[;&|`$]", re.IGNORECASE),
    re.compile(r"(rm\s+-rf)", re.IGNORECASE),
    re.compile(r"(wget\s+)", re.IGNORECASE),
    re.compile(r"(curl\s+)", re.IGNORECASE),
    re.compile(r"(nc\s+)", re.IGNORECASE),
]


def sanitize_message_text(text: str, max_length: int = 2000) -> str:
    """
    Sanitize message text to prevent XSS attacks and ensure safe content

    Args:
        text: Raw message text
        max_length: Maximum allowed length

    Returns:
        Sanitized message text

    Raises:
        ValueError: If text is empty or too long
    """
    if not text or not text.strip():
        raise ValueError("Message text cannot be empty")

    # Trim whitespace
    text = text.strip()

    # Check length
    if len(text) > max_length:
        raise ValueError(f"Message text cannot exceed {max_length} characters")

    # Normalize unicode characters to prevent bypass attempts
    text = unicodedata.normalize("NFKC", text)

    # Remove control characters
    text = CONTROL_CHARS.sub("", text)

    # Check for malicious patterns before HTML escaping
    if _contains_malicious_patterns(text):
        logger.warning(f"Malicious patterns detected in message: {text[:100]}...")
        raise ValueError("Message contains potentially malicious content")

    # HTML escape to prevent XSS
    text = html.escape(text)

    # Remove dangerous patterns (multiple passes for nested attacks)
    for _ in range(3):  # Multiple passes to catch nested patterns
        text = SCRIPT_PATTERN.sub("", text)
        text = JAVASCRIPT_PATTERN.sub("", text)
        text = VBSCRIPT_PATTERN.sub("", text)
        text = EVENT_HANDLER_PATTERN.sub("", text)
        text = DATA_URL_PATTERN.sub("", text)
        text = EXPRESSION_PATTERN.sub("", text)
        text = IMPORT_PATTERN.sub("", text)
        text = STYLE_PATTERN.sub("", text)
        text = IFRAME_PATTERN.sub("", text)
        text = OBJECT_PATTERN.sub("", text)
        text = EMBED_PATTERN.sub("", text)
        text = FORM_PATTERN.sub("", text)

    # Use bleach for additional sanitization
    text = bleach.clean(
        text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True
    )

    # Validate and sanitize any URLs found in the text
    text = _sanitize_urls_in_text(text)

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Final length check after sanitization
    if len(text) > max_length:
        text = text[:max_length].strip()

    return text


def sanitize_user_name(name: str, max_length: int = 255) -> str:
    """
    Sanitize user name input

    Args:
        name: Raw user name
        max_length: Maximum allowed length

    Returns:
        Sanitized user name
    """
    if not name or not name.strip():
        return ""

    name = name.strip()

    # Check length
    if len(name) > max_length:
        name = name[:max_length]

    # HTML escape
    name = html.escape(name)

    # Remove non-printable characters and potentially dangerous chars
    name = re.sub(r"[^\w\s\-\.\']", "", name)

    # Remove excessive whitespace
    name = re.sub(r"\s+", " ", name).strip()

    return name


def validate_email(email: str) -> Optional[str]:
    """
    Validate and normalize email address

    Args:
        email: Raw email address

    Returns:
        Normalized email or None if invalid
    """
    if not email or not email.strip():
        return None

    email = email.strip().lower()

    # Basic email pattern validation
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(email_pattern, email):
        raise ValueError("Invalid email format")

    # Additional checks for suspicious patterns
    if ".." in email or email.startswith(".") or email.endswith("."):
        raise ValueError("Invalid email format")

    return email


def validate_session_id(session_id: str) -> str:
    """
    Validate session ID format

    Args:
        session_id: Raw session ID

    Returns:
        Validated session ID

    Raises:
        ValueError: If session ID is invalid
    """
    if not session_id or not session_id.strip():
        raise ValueError("Session ID cannot be empty")

    session_id = session_id.strip()

    # Check length
    if len(session_id) > 255:
        raise ValueError("Session ID too long")

    # Allow only alphanumeric characters, hyphens, and underscores
    if not re.match(r"^[a-zA-Z0-9_-]+$", session_id):
        raise ValueError("Session ID contains invalid characters")

    return session_id


def check_rate_limit_content(text: str) -> bool:
    """
    Check if message content suggests spam or abuse

    Args:
        text: Message text to check

    Returns:
        True if content seems suspicious
    """
    # Convert to lowercase for checking
    text_lower = text.lower()

    # Check for excessive repetition
    words = text_lower.split()
    if len(words) > 5:
        unique_words = set(words)
        if len(unique_words) / len(words) < 0.3:  # Less than 30% unique words
            logger.warning(
                f"Suspicious repetitive content detected: {len(unique_words)}/{len(words)} unique words"
            )
            return True

    # Check for excessive capitalization
    if len(text) > 20:
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
        if caps_ratio > 0.7:  # More than 70% caps
            logger.warning(f"Excessive capitalization detected: {caps_ratio:.2%}")
            return True

    # Check for suspicious patterns
    spam_patterns = [
        r"(buy now|click here|limited time|act now)",
        r"(www\.|http|\.com|\.net|\.org)",
        r"(\$\d+|\d+\$|free money|make money)",
    ]

    for pattern in spam_patterns:
        if re.search(pattern, text_lower):
            logger.warning(f"Suspicious pattern detected: {pattern}")
            return True

    return False


def _contains_malicious_patterns(text: str) -> bool:
    """
    Check if text contains malicious patterns

    Args:
        text: Text to check

    Returns:
        True if malicious patterns are found
    """
    # Check for SQL injection patterns
    for pattern in SQL_INJECTION_PATTERNS:
        if pattern.search(text):
            logger.warning(f"SQL injection pattern detected: {pattern.pattern}")
            return True

    # Check for command injection patterns
    for pattern in COMMAND_INJECTION_PATTERNS:
        if pattern.search(text):
            logger.warning(f"Command injection pattern detected: {pattern.pattern}")
            return True

    # Check for excessive HTML tags (potential XSS)
    html_tag_count = len(re.findall(r"<[^>]+>", text))
    if html_tag_count > 5:
        logger.warning(f"Excessive HTML tags detected: {html_tag_count}")
        return True

    # Check for encoded attacks
    if _contains_encoded_attacks(text):
        return True

    return False


def _contains_encoded_attacks(text: str) -> bool:
    """
    Check for encoded attack patterns

    Args:
        text: Text to check

    Returns:
        True if encoded attacks are found
    """
    # Check for URL encoded attacks
    try:
        decoded = urllib.parse.unquote(text)
        if decoded != text:
            # Check if decoded version contains dangerous patterns
            dangerous_patterns = [
                "<script",
                "javascript:",
                "vbscript:",
                "onload=",
                "onerror=",
            ]
            for pattern in dangerous_patterns:
                if pattern.lower() in decoded.lower():
                    logger.warning(f"URL encoded attack detected: {pattern}")
                    return True
    except Exception:
        pass

    # Check for HTML entity encoded attacks
    try:
        decoded = html.unescape(text)
        if decoded != text:
            dangerous_patterns = [
                "<script",
                "javascript:",
                "vbscript:",
                "onload=",
                "onerror=",
            ]
            for pattern in dangerous_patterns:
                if pattern.lower() in decoded.lower():
                    logger.warning(f"HTML entity encoded attack detected: {pattern}")
                    return True
    except Exception:
        pass

    return False


def _sanitize_urls_in_text(text: str) -> str:
    """
    Sanitize URLs found in text

    Args:
        text: Text containing potential URLs

    Returns:
        Text with sanitized URLs
    """

    def sanitize_url(match):
        url = match.group(0)
        try:
            # Parse the URL
            parsed = urllib.parse.urlparse(url)

            # Check for dangerous schemes
            if parsed.scheme.lower() in ["javascript", "vbscript", "data"]:
                return "[REMOVED_UNSAFE_URL]"

            # Only allow http and https
            if parsed.scheme.lower() not in ["http", "https"]:
                return "[REMOVED_UNSAFE_URL]"

            # Basic domain validation
            if not parsed.netloc or ".." in parsed.netloc:
                return "[REMOVED_UNSAFE_URL]"

            return url
        except Exception:
            return "[REMOVED_INVALID_URL]"

    return URL_PATTERN.sub(sanitize_url, text)


def validate_message_content_security(text: str) -> List[str]:
    """
    Validate message content for security issues

    Args:
        text: Message text to validate

    Returns:
        List of security warnings (empty if safe)
    """
    warnings = []

    # Check for potential XSS
    if re.search(r"<[^>]*script", text, re.IGNORECASE):
        warnings.append("Potential XSS: script tags detected")

    # Check for potential SQL injection
    for pattern in SQL_INJECTION_PATTERNS:
        if pattern.search(text):
            warnings.append(f"Potential SQL injection: {pattern.pattern}")

    # Check for potential command injection
    for pattern in COMMAND_INJECTION_PATTERNS:
        if pattern.search(text):
            warnings.append(f"Potential command injection: {pattern.pattern}")

    # Check for suspicious URLs
    urls = URL_PATTERN.findall(text)
    for url in urls:
        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme.lower() in ["javascript", "vbscript", "data"]:
                warnings.append(f"Dangerous URL scheme: {parsed.scheme}")
        except Exception:
            warnings.append(f"Invalid URL format: {url}")

    return warnings


def sanitize_admin_message(text: str, max_length: int = 2000) -> str:
    """
    Sanitize admin message with slightly more permissive rules

    Args:
        text: Raw admin message text
        max_length: Maximum allowed length

    Returns:
        Sanitized admin message text
    """
    if not text or not text.strip():
        raise ValueError("Admin message cannot be empty")

    text = text.strip()

    if len(text) > max_length:
        raise ValueError(f"Admin message cannot exceed {max_length} characters")

    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)

    # Remove control characters
    text = CONTROL_CHARS.sub("", text)

    # For admin messages, we still need to be careful about XSS
    # but we might be slightly more permissive in the future
    text = html.escape(text)

    # Remove dangerous patterns (fewer passes since admins are trusted)
    text = SCRIPT_PATTERN.sub("", text)
    text = JAVASCRIPT_PATTERN.sub("", text)
    text = VBSCRIPT_PATTERN.sub("", text)
    text = EVENT_HANDLER_PATTERN.sub("", text)
    text = DATA_URL_PATTERN.sub("", text)

    # Clean with bleach
    text = bleach.clean(
        text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True
    )

    # Sanitize URLs
    text = _sanitize_urls_in_text(text)

    return text


def get_content_security_score(text: str) -> float:
    """
    Calculate a security score for content (0.0 = very dangerous, 1.0 = safe)

    Args:
        text: Text to analyze

    Returns:
        Security score between 0.0 and 1.0
    """
    score = 1.0

    # Deduct points for various security issues
    warnings = validate_message_content_security(text)
    score -= len(warnings) * 0.2

    # Deduct points for suspicious patterns
    if check_rate_limit_content(text):
        score -= 0.3

    # Deduct points for excessive length
    if len(text) > 1000:
        score -= 0.1

    # Deduct points for control characters
    if CONTROL_CHARS.search(text):
        score -= 0.2

    # Ensure score is between 0 and 1
    return max(0.0, min(1.0, score))
