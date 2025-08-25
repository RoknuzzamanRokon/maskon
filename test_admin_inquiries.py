#!/usr/bin/env python3
"""
Test script for admin inquiry management system
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"  # Update with your admin username
ADMIN_PASSWORD = "admin123"  # Update with your admin password


def login_admin():
    """Login as admin and get token"""
    login_data = {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}

    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        return data["access_token"]
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None


def test_get_inquiries(token):
    """Test getting product inquiries"""
    headers = {"Authorization": f"Bearer {token}"}

    print("Testing GET /api/admin/inquiries...")
    response = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully retrieved inquiries")

        # Handle both response formats
        inquiries = data.get("inquiries", data) if isinstance(data, dict) else data
        print(f"  Found {len(inquiries)} inquiries")

        if inquiries:
            inquiry = inquiries[0]
            print(
                f"  Sample inquiry: ID={inquiry['id']}, Status={inquiry['status']}, Product={inquiry.get('product_name', 'N/A')}"
            )
            return inquiry["id"]
        else:
            print("  No inquiries found")
            return None
    else:
        print(f"✗ Failed to get inquiries: {response.status_code} - {response.text}")
        return None


def test_get_inquiry_stats(token):
    """Test getting inquiry statistics"""
    headers = {"Authorization": f"Bearer {token}"}

    print("\nTesting GET /api/admin/inquiries/stats...")
    response = requests.get(f"{BASE_URL}/api/admin/inquiries/stats", headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully retrieved inquiry stats")
        print(f"  Total inquiries: {data.get('total_inquiries', 0)}")
        print(f"  Unread messages: {data.get('unread_messages', 0)}")
        print(f"  Today's inquiries: {data.get('today_inquiries', 0)}")
        print(f"  Status counts: {data.get('status_counts', {})}")
    else:
        print(
            f"✗ Failed to get inquiry stats: {response.status_code} - {response.text}"
        )


def test_get_inquiry_messages(token, inquiry_id):
    """Test getting messages for an inquiry"""
    if not inquiry_id:
        print("\nSkipping message test - no inquiry ID available")
        return

    headers = {"Authorization": f"Bearer {token}"}

    print(f"\nTesting GET /api/admin/inquiries/{inquiry_id}/messages...")
    response = requests.get(
        f"{BASE_URL}/api/admin/inquiries/{inquiry_id}/messages", headers=headers
    )

    if response.status_code == 200:
        messages = response.json()
        print(
            f"✓ Successfully retrieved {len(messages)} messages for inquiry {inquiry_id}"
        )

        if messages:
            message = messages[0]
            print(
                f"  Sample message: From={message['sender_type']}, Text='{message['message_text'][:50]}...'"
            )
    else:
        print(
            f"✗ Failed to get inquiry messages: {response.status_code} - {response.text}"
        )


def test_respond_to_inquiry(token, inquiry_id):
    """Test responding to an inquiry"""
    if not inquiry_id:
        print("\nSkipping response test - no inquiry ID available")
        return

    headers = {"Authorization": f"Bearer {token}"}

    response_data = {
        "message_text": f"Test admin response at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "admin_id": 1,  # Assuming admin ID 1
        "admin_name": "Test Admin",
    }

    print(f"\nTesting POST /api/admin/inquiries/{inquiry_id}/respond...")
    response = requests.post(
        f"{BASE_URL}/api/admin/inquiries/{inquiry_id}/respond",
        json=response_data,
        headers=headers,
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully sent response to inquiry {inquiry_id}")
        print(f"  Message ID: {data.get('message_id')}")
    else:
        print(f"✗ Failed to send response: {response.status_code} - {response.text}")


def test_update_inquiry_status(token, inquiry_id):
    """Test updating inquiry status"""
    if not inquiry_id:
        print("\nSkipping status update test - no inquiry ID available")
        return

    headers = {"Authorization": f"Bearer {token}"}

    status_data = {"status": "in_progress"}

    print(f"\nTesting PUT /api/admin/inquiries/{inquiry_id}/status...")
    response = requests.put(
        f"{BASE_URL}/api/admin/inquiries/{inquiry_id}/status",
        json=status_data,
        headers=headers,
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully updated inquiry status to 'in_progress'")
        print(f"  Response: {data.get('message')}")
    else:
        print(
            f"✗ Failed to update inquiry status: {response.status_code} - {response.text}"
        )


def main():
    print("Testing Admin Inquiry Management System")
    print("=" * 50)

    # Login
    token = login_admin()
    if not token:
        print(
            "Failed to login. Please check your credentials and ensure the backend is running."
        )
        sys.exit(1)

    print(f"✓ Successfully logged in as admin")

    # Test all endpoints
    inquiry_id = test_get_inquiries(token)
    test_get_inquiry_stats(token)
    test_get_inquiry_messages(token, inquiry_id)
    test_respond_to_inquiry(token, inquiry_id)
    test_update_inquiry_status(token, inquiry_id)

    print("\n" + "=" * 50)
    print("Admin inquiry management system test completed!")
    print(
        "\nNote: If no inquiries were found, create some test chat sessions first by:"
    )
    print("1. Visit a product page on the frontend")
    print("2. Start a chat conversation")
    print("3. Send some messages")
    print("4. Run this test again")


if __name__ == "__main__":
    main()
