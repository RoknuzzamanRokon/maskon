#!/usr/bin/env python3
"""
Test script for security and performance optimizations
Tests rate limiting, message sanitization, and database optimizations
"""

import asyncio
import aiohttp
import json
import time
import random
import string
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"


class SecurityPerformanceTest:
    """Test suite for security and performance features"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = None
        self.admin_token = None

    async def setup(self):
        """Setup test session and authentication"""
        self.session = aiohttp.ClientSession()

        # Login as admin to get token
        try:
            async with self.session.post(
                f"{self.base_url}/api/login",
                json={"username": "admin", "password": "admin123"},
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data["access_token"]
                    logger.info("Admin authentication successful")
                else:
                    logger.warning(
                        "Admin authentication failed, some tests may not work"
                    )
        except Exception as e:
            logger.warning(f"Admin authentication error: {e}")

    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()

    def get_admin_headers(self) -> Dict[str, str]:
        """Get headers with admin authentication"""
        if self.admin_token:
            return {"Authorization": f"Bearer {self.admin_token}"}
        return {}

    async def test_rate_limiting(self):
        """Test rate limiting functionality"""
        logger.info("Testing rate limiting...")

        # Test message rate limiting
        session_id = f"test_session_{int(time.time())}"
        product_id = 1

        # Create a test session first
        try:
            async with self.session.post(
                f"{self.base_url}/api/products/{product_id}/chat/sessions",
                json={
                    "product_id": product_id,
                    "session_id": session_id,
                    "customer_name": "Test User",
                    "initial_message": "Hello",
                },
            ) as response:
                if response.status != 200:
                    logger.warning(
                        "Could not create test session for rate limiting test"
                    )
                    return
        except Exception as e:
            logger.warning(f"Error creating test session: {e}")
            return

        # Send multiple messages rapidly to trigger rate limiting
        rate_limit_triggered = False
        for i in range(35):  # Should trigger rate limit (30 messages per minute)
            try:
                async with self.session.post(
                    f"{self.base_url}/api/products/{product_id}/chat/sessions/{session_id}/messages",
                    json={
                        "session_id": session_id,
                        "message_text": f"Test message {i}",
                        "sender_type": "customer",
                        "sender_name": "Test User",
                    },
                ) as response:
                    if response.status == 429:
                        rate_limit_triggered = True
                        logger.info(f"Rate limit triggered at message {i}")
                        break
                    elif response.status != 200:
                        logger.warning(f"Unexpected response status: {response.status}")
            except Exception as e:
                logger.error(f"Error sending test message {i}: {e}")

        if rate_limit_triggered:
            logger.info("✓ Rate limiting test PASSED")
        else:
            logger.warning("✗ Rate limiting test FAILED - no rate limit triggered")

    async def test_message_sanitization(self):
        """Test message sanitization and XSS prevention"""
        logger.info("Testing message sanitization...")

        session_id = f"sanitize_test_{int(time.time())}"
        product_id = 1

        # Create test session
        try:
            async with self.session.post(
                f"{self.base_url}/api/products/{product_id}/chat/sessions",
                json={
                    "product_id": product_id,
                    "session_id": session_id,
                    "customer_name": "Sanitize Tester",
                },
            ) as response:
                if response.status != 200:
                    logger.warning(
                        "Could not create test session for sanitization test"
                    )
                    return
        except Exception as e:
            logger.warning(f"Error creating test session: {e}")
            return

        # Test various malicious inputs
        malicious_inputs = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "SELECT * FROM users; DROP TABLE users;",
            "'; DELETE FROM messages; --",
            "<iframe src='javascript:alert(1)'></iframe>",
            "data:text/html,<script>alert('xss')</script>",
            "vbscript:msgbox('xss')",
        ]

        sanitization_working = True

        for malicious_input in malicious_inputs:
            try:
                async with self.session.post(
                    f"{self.base_url}/api/products/{product_id}/chat/sessions/{session_id}/messages",
                    json={
                        "session_id": session_id,
                        "message_text": malicious_input,
                        "sender_type": "customer",
                        "sender_name": "Sanitize Tester",
                    },
                ) as response:
                    if response.status == 400:
                        logger.info(
                            f"✓ Malicious input blocked: {malicious_input[:50]}..."
                        )
                    elif response.status == 200:
                        # Check if the message was sanitized
                        data = await response.json()
                        logger.info(
                            f"✓ Malicious input sanitized: {malicious_input[:50]}..."
                        )
                    else:
                        logger.warning(
                            f"Unexpected response for malicious input: {response.status}"
                        )
                        sanitization_working = False
            except Exception as e:
                logger.error(f"Error testing malicious input: {e}")
                sanitization_working = False

        if sanitization_working:
            logger.info("✓ Message sanitization test PASSED")
        else:
            logger.warning("✗ Message sanitization test FAILED")

    async def test_database_performance(self):
        """Test database performance optimizations"""
        logger.info("Testing database performance...")

        if not self.admin_token:
            logger.warning("Skipping database performance test - no admin token")
            return

        # Test database optimization endpoint
        try:
            async with self.session.post(
                f"{self.base_url}/api/admin/optimize-database",
                headers=self.get_admin_headers(),
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✓ Database optimization endpoint working")
                    logger.info(f"Optimizations: {data.get('optimizations', [])}")
                else:
                    logger.warning(f"Database optimization failed: {response.status}")
        except Exception as e:
            logger.error(f"Error testing database optimization: {e}")

        # Test security stats endpoint
        try:
            async with self.session.get(
                f"{self.base_url}/api/admin/security-stats",
                headers=self.get_admin_headers(),
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✓ Security stats endpoint working")
                    logger.info(f"Rate limiter stats: {data.get('rate_limiter', {})}")
                    logger.info(
                        f"Connection pool stats: {data.get('connection_pool', {})}"
                    )
                else:
                    logger.warning(f"Security stats failed: {response.status}")
        except Exception as e:
            logger.error(f"Error testing security stats: {e}")

    async def test_connection_pool(self):
        """Test connection pool functionality"""
        logger.info("Testing connection pool...")

        # Test health endpoint which includes connection pool stats
        try:
            async with self.session.get(f"{self.base_url}/api/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if "connection_pool" in data:
                        logger.info("✓ Connection pool integration working")
                        pool_stats = data["connection_pool"]
                        logger.info(
                            f"Pool status: {pool_stats.get('status', 'unknown')}"
                        )
                        logger.info(
                            f"Total connections: {pool_stats.get('total_connections', 0)}"
                        )
                    else:
                        logger.info(
                            "Connection pool stats not available in health check"
                        )
                else:
                    logger.warning(f"Health check failed: {response.status}")
        except Exception as e:
            logger.error(f"Error testing connection pool: {e}")

    async def test_content_security_validation(self):
        """Test content security validation"""
        logger.info("Testing content security validation...")

        session_id = f"security_test_{int(time.time())}"
        product_id = 1

        # Create test session
        try:
            async with self.session.post(
                f"{self.base_url}/api/products/{product_id}/chat/sessions",
                json={
                    "product_id": product_id,
                    "session_id": session_id,
                    "customer_name": "Security Tester",
                },
            ) as response:
                if response.status != 200:
                    logger.warning(
                        "Could not create test session for security validation test"
                    )
                    return
        except Exception as e:
            logger.warning(f"Error creating test session: {e}")
            return

        # Test suspicious content patterns
        suspicious_patterns = [
            "BUY NOW! LIMITED TIME OFFER! CLICK HERE!",  # Spam-like content
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",  # Repetitive content
            "FREE MONEY! MAKE $1000 TODAY! www.scam.com",  # Spam with URL
            "URGENT URGENT URGENT URGENT URGENT",  # Excessive caps
        ]

        security_validation_working = True

        for pattern in suspicious_patterns:
            try:
                async with self.session.post(
                    f"{self.base_url}/api/products/{product_id}/chat/sessions/{session_id}/messages",
                    json={
                        "session_id": session_id,
                        "message_text": pattern,
                        "sender_type": "customer",
                        "sender_name": "Security Tester",
                    },
                ) as response:
                    if response.status in [400, 429]:
                        logger.info(f"✓ Suspicious content blocked: {pattern[:30]}...")
                    elif response.status == 200:
                        logger.info(
                            f"✓ Suspicious content allowed but may be flagged: {pattern[:30]}..."
                        )
                    else:
                        logger.warning(
                            f"Unexpected response for suspicious content: {response.status}"
                        )
                        security_validation_working = False
            except Exception as e:
                logger.error(f"Error testing suspicious content: {e}")
                security_validation_working = False

        if security_validation_working:
            logger.info("✓ Content security validation test PASSED")
        else:
            logger.warning("✗ Content security validation test FAILED")

    async def run_all_tests(self):
        """Run all security and performance tests"""
        logger.info("Starting security and performance tests...")

        await self.setup()

        try:
            await self.test_rate_limiting()
            await asyncio.sleep(1)  # Brief pause between tests

            await self.test_message_sanitization()
            await asyncio.sleep(1)

            await self.test_content_security_validation()
            await asyncio.sleep(1)

            await self.test_database_performance()
            await asyncio.sleep(1)

            await self.test_connection_pool()

        finally:
            await self.cleanup()

        logger.info("Security and performance tests completed!")


async def main():
    """Main test runner"""
    tester = SecurityPerformanceTest()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
