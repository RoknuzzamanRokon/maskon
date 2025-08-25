"""
Rate limiting utilities for chat functionality
Provides comprehensive rate limiting to prevent spam and abuse
"""

import time
import asyncio
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
import logging
import hashlib

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""

    def __init__(self, message: str, retry_after: int = None):
        self.message = message
        self.retry_after = retry_after
        super().__init__(message)


class TokenBucket:
    """Token bucket implementation for rate limiting"""

    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.last_refill = time.time()

    def consume(self, tokens: int = 1) -> bool:
        """Try to consume tokens from the bucket"""
        now = time.time()

        # Refill tokens based on time elapsed
        time_passed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + time_passed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

    def time_until_available(self, tokens: int = 1) -> float:
        """Calculate time until enough tokens are available"""
        if self.tokens >= tokens:
            return 0.0

        needed_tokens = tokens - self.tokens
        return needed_tokens / self.refill_rate


class SlidingWindowRateLimiter:
    """Sliding window rate limiter implementation"""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, identifier: str) -> Tuple[bool, Optional[int]]:
        """Check if request is allowed for the identifier"""
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        request_times = self.requests[identifier]
        while request_times and request_times[0] < window_start:
            request_times.popleft()

        # Check if under limit
        if len(request_times) < self.max_requests:
            request_times.append(now)
            return True, None

        # Calculate retry after time
        oldest_request = request_times[0]
        retry_after = int(oldest_request + self.window_seconds - now) + 1
        return False, retry_after

    def cleanup_old_entries(self, max_age_seconds: int = 3600):
        """Clean up old entries to prevent memory leaks"""
        cutoff_time = time.time() - max_age_seconds

        identifiers_to_remove = []
        for identifier, request_times in self.requests.items():
            # Remove old requests
            while request_times and request_times[0] < cutoff_time:
                request_times.popleft()

            # Remove empty entries
            if not request_times:
                identifiers_to_remove.append(identifier)

        for identifier in identifiers_to_remove:
            del self.requests[identifier]


class ChatRateLimiter:
    """Comprehensive rate limiter for chat functionality"""

    def __init__(self):
        # Message sending limits
        self.message_limiter = SlidingWindowRateLimiter(
            max_requests=30, window_seconds=60  # 30 messages per minute
        )

        # Connection limits (more permissive for WebSocket reconnections)
        self.connection_limiter = SlidingWindowRateLimiter(
            max_requests=50, window_seconds=300  # 50 connections per 5 minutes
        )

        # Session creation limits
        self.session_limiter = SlidingWindowRateLimiter(
            max_requests=5, window_seconds=3600  # 5 new sessions per hour
        )

        # Token buckets for burst control
        self.token_buckets: Dict[str, TokenBucket] = {}

        # Blocked IPs/sessions (temporary blocks)
        self.blocked_until: Dict[str, float] = {}

        # Suspicious activity tracking
        self.suspicious_activity: Dict[str, int] = defaultdict(int)

        # Last cleanup time
        self.last_cleanup = time.time()

    def _get_identifier(self, ip_address: str, session_id: str = None) -> str:
        """Generate identifier for rate limiting"""
        if session_id:
            return f"session:{session_id}"
        return f"ip:{ip_address}"

    def _cleanup_if_needed(self):
        """Perform cleanup if needed"""
        now = time.time()
        if now - self.last_cleanup > 300:  # Cleanup every 5 minutes
            self._cleanup_old_data()
            self.last_cleanup = now

    def _cleanup_old_data(self):
        """Clean up old data to prevent memory leaks"""
        now = time.time()

        # Clean up rate limiters
        self.message_limiter.cleanup_old_entries()
        self.connection_limiter.cleanup_old_entries()
        self.session_limiter.cleanup_old_entries()

        # Clean up expired blocks
        expired_blocks = [
            identifier
            for identifier, until_time in self.blocked_until.items()
            if now > until_time
        ]
        for identifier in expired_blocks:
            del self.blocked_until[identifier]

        # Clean up old token buckets (inactive for 1 hour)
        old_buckets = []
        for identifier, bucket in self.token_buckets.items():
            if now - bucket.last_refill > 3600:
                old_buckets.append(identifier)

        for identifier in old_buckets:
            del self.token_buckets[identifier]

        # Reset suspicious activity counters periodically
        if len(self.suspicious_activity) > 1000:
            self.suspicious_activity.clear()

    def _is_blocked(self, identifier: str) -> Tuple[bool, Optional[int]]:
        """Check if identifier is temporarily blocked"""
        if identifier in self.blocked_until:
            now = time.time()
            if now < self.blocked_until[identifier]:
                retry_after = int(self.blocked_until[identifier] - now) + 1
                return True, retry_after
            else:
                del self.blocked_until[identifier]
        return False, None

    def _block_temporarily(self, identifier: str, duration_seconds: int):
        """Temporarily block an identifier"""
        self.blocked_until[identifier] = time.time() + duration_seconds
        logger.warning(
            f"Temporarily blocked {identifier} for {duration_seconds} seconds"
        )

    def _get_or_create_token_bucket(self, identifier: str) -> TokenBucket:
        """Get or create token bucket for identifier"""
        if identifier not in self.token_buckets:
            self.token_buckets[identifier] = TokenBucket(
                capacity=10,  # 10 tokens
                refill_rate=0.5,  # 0.5 tokens per second (1 token every 2 seconds)
            )
        return self.token_buckets[identifier]

    def check_message_rate_limit(
        self, ip_address: str, session_id: str = None, message_length: int = 0
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """
        Check if message sending is allowed

        Returns:
            (is_allowed, retry_after_seconds, reason)
        """
        self._cleanup_if_needed()

        identifier = self._get_identifier(ip_address, session_id)

        # Check if temporarily blocked
        is_blocked, retry_after = self._is_blocked(identifier)
        if is_blocked:
            return False, retry_after, "Temporarily blocked due to suspicious activity"

        # Check sliding window limit
        allowed, retry_after = self.message_limiter.is_allowed(identifier)
        if not allowed:
            self.suspicious_activity[identifier] += 1

            # Block if too many violations
            if self.suspicious_activity[identifier] >= 5:
                self._block_temporarily(identifier, 300)  # 5 minutes
                return False, 300, "Blocked due to repeated rate limit violations"

            return False, retry_after, "Message rate limit exceeded"

        # Check token bucket for burst control
        bucket = self._get_or_create_token_bucket(identifier)

        # Larger messages consume more tokens
        tokens_needed = max(1, message_length // 500)  # 1 token per 500 characters

        if not bucket.consume(tokens_needed):
            retry_after = int(bucket.time_until_available(tokens_needed)) + 1
            return False, retry_after, "Burst limit exceeded"

        # Reset suspicious activity counter on successful request
        if identifier in self.suspicious_activity:
            self.suspicious_activity[identifier] = max(
                0, self.suspicious_activity[identifier] - 1
            )

        return True, None, None

    def check_connection_rate_limit(
        self, ip_address: str
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """Check if new connection is allowed"""
        self._cleanup_if_needed()

        identifier = f"ip:{ip_address}"

        # Check if temporarily blocked
        is_blocked, retry_after = self._is_blocked(identifier)
        if is_blocked:
            return False, retry_after, "Temporarily blocked"

        # Check connection limit
        allowed, retry_after = self.connection_limiter.is_allowed(identifier)
        if not allowed:
            return False, retry_after, "Connection rate limit exceeded"

        return True, None, None

    def check_session_creation_rate_limit(
        self, ip_address: str
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """Check if new session creation is allowed"""
        self._cleanup_if_needed()

        identifier = f"ip:{ip_address}"

        # Check if temporarily blocked
        is_blocked, retry_after = self._is_blocked(identifier)
        if is_blocked:
            return False, retry_after, "Temporarily blocked"

        # Check session creation limit
        allowed, retry_after = self.session_limiter.is_allowed(identifier)
        if not allowed:
            return False, retry_after, "Session creation rate limit exceeded"

        return True, None, None

    def report_suspicious_activity(self, ip_address: str, session_id: str = None):
        """Report suspicious activity for an identifier"""
        identifier = self._get_identifier(ip_address, session_id)
        self.suspicious_activity[identifier] += 2

        # Auto-block if too much suspicious activity
        if self.suspicious_activity[identifier] >= 10:
            self._block_temporarily(identifier, 600)  # 10 minutes

    def get_stats(self) -> Dict:
        """Get rate limiter statistics"""
        now = time.time()

        return {
            "active_token_buckets": len(self.token_buckets),
            "blocked_identifiers": len(self.blocked_until),
            "suspicious_identifiers": len(self.suspicious_activity),
            "message_limiter_entries": len(self.message_limiter.requests),
            "connection_limiter_entries": len(self.connection_limiter.requests),
            "session_limiter_entries": len(self.session_limiter.requests),
            "currently_blocked": [
                identifier
                for identifier, until_time in self.blocked_until.items()
                if now < until_time
            ],
        }


# Global rate limiter instance
chat_rate_limiter = ChatRateLimiter()


# Cleanup task
async def rate_limiter_cleanup_task():
    """Background task to clean up rate limiter data"""
    while True:
        try:
            chat_rate_limiter._cleanup_old_data()
            await asyncio.sleep(300)  # Run every 5 minutes
        except Exception as e:
            logger.error(f"Error in rate limiter cleanup task: {e}")
            await asyncio.sleep(300)
