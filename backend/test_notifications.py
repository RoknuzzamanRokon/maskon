#!/usr/bin/env python3
"""
Test script for the admin notification system
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.append(".")

from utils.notification_service import get_notification_service
from websocket_manager import websocket_manager


async def test_notification_system():
    """Test the notification system components"""
    print("🔔 Testing Admin Notification System")
    print("=" * 50)

    # Initialize notification service
    notification_service = get_notification_service(websocket_manager)

    # Test data for all tests
    inquiry_data = {
        "id": 999,
        "session_id": "test_session_123",
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "priority": "medium",
        "initial_message": "This is a test notification message.",
    }

    product_data = {"id": 1, "name": "Test Product", "price": 99.99, "category": "test"}

    # Test 1: Check configuration
    print("\n1. Configuration Status:")
    print(f"   ✓ Email configured: {notification_service.email_service.is_configured}")
    print(
        f"   ✓ Admin emails count: {len(notification_service.email_service.admin_emails)}"
    )
    print(
        f"   ✓ WebSocket enabled: {notification_service.websocket_manager is not None}"
    )

    # Test 2: Test notification stats
    print("\n2. Notification Stats:")
    stats = notification_service.get_notification_stats()
    for key, value in stats.items():
        print(f"   ✓ {key}: {value}")

    # Test 3: Test email service (if configured)
    if notification_service.email_service.is_configured:
        print("\n3. Testing Email Notifications:")

        try:
            # Test new inquiry notification
            success = (
                await notification_service.email_service.send_new_inquiry_notification(
                    inquiry_data, product_data
                )
            )
            print(
                f"   ✓ New inquiry notification: {'SUCCESS' if success else 'FAILED'}"
            )

            # Test urgent inquiry notification
            inquiry_data["priority"] = "urgent"
            success = await notification_service.email_service.send_urgent_inquiry_notification(
                inquiry_data, product_data
            )
            print(
                f"   ✓ Urgent inquiry notification: {'SUCCESS' if success else 'FAILED'}"
            )

        except Exception as e:
            print(f"   ✗ Email test failed: {e}")
    else:
        print("\n3. Email Notifications: SKIPPED (not configured)")
        print("   To enable email notifications:")
        print("   - Set SMTP_USERNAME and SMTP_PASSWORD in .env file")
        print("   - Set ADMIN_EMAILS with comma-separated admin email addresses")

    # Test 4: Test WebSocket manager
    print("\n4. WebSocket Manager:")
    if websocket_manager:
        stats = websocket_manager.get_connection_stats()
        print(f"   ✓ Total connections: {stats['total_connections']}")
        print(f"   ✓ Admin connections: {stats['admin_connections']}")
        print(f"   ✓ Active sessions: {stats['active_sessions']}")
    else:
        print("   ✗ WebSocket manager not available")

    # Test 5: Test notification methods
    print("\n5. Testing Notification Methods:")

    try:
        # Test new inquiry notification (without email)
        await notification_service.notify_new_inquiry(inquiry_data, product_data)
        print("   ✓ notify_new_inquiry: SUCCESS")
    except Exception as e:
        print(f"   ✗ notify_new_inquiry: FAILED - {e}")

    try:
        # Test urgent message notification
        message_data = {"id": 1, "message_text": "This is an urgent test message"}
        await notification_service.notify_urgent_message(
            message_data, inquiry_data, product_data
        )
        print("   ✓ notify_urgent_message: SUCCESS")
    except Exception as e:
        print(f"   ✗ notify_urgent_message: FAILED - {e}")

    print("\n" + "=" * 50)
    print("✅ Notification system test completed!")

    if not notification_service.email_service.is_configured:
        print("\n💡 To fully test email notifications:")
        print("   1. Copy backend/.env.example to backend/.env")
        print("   2. Configure SMTP settings in .env file")
        print("   3. Run this test again")


if __name__ == "__main__":
    asyncio.run(test_notification_system())
