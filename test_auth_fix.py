#!/usr/bin/env python3
"""
Test script to verify the authentication fix for admin inquiry management
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"  # Update with your admin username
ADMIN_PASSWORD = "admin123"  # Update with your admin password


def test_authentication_flow():
    """Test the complete authentication flow"""
    print("Testing Authentication Flow")
    print("=" * 40)

    # Step 1: Login
    print("1. Testing login...")
    login_data = {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}

    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    if response.status_code != 200:
        print(f"✗ Login failed: {response.status_code} - {response.text}")
        return None

    data = response.json()
    token = data["access_token"]
    print(f"✓ Login successful, token received")

    # Step 2: Test /api/me endpoint
    print("\n2. Testing /api/me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/me", headers=headers)

    if response.status_code == 200:
        user_info = response.json()
        print(f"✓ /api/me successful")
        print(f"  User: {user_info['username']}")
        print(f"  Admin: {user_info['is_admin']}")
    else:
        print(f"✗ /api/me failed: {response.status_code} - {response.text}")
        return None

    # Step 3: Test debug auth endpoint
    print("\n3. Testing /api/debug/auth endpoint...")
    response = requests.get(f"{BASE_URL}/api/debug/auth", headers=headers)

    if response.status_code == 200:
        debug_info = response.json()
        print(f"✓ Debug auth successful")
        print(f"  Authenticated: {debug_info['authenticated']}")
        print(f"  User ID: {debug_info['user_id']}")
        print(f"  Is Admin: {debug_info['is_admin']}")
    else:
        print(f"✗ Debug auth failed: {response.status_code} - {response.text}")
        return None

    # Step 4: Test admin inquiries endpoint
    print("\n4. Testing /api/admin/inquiries endpoint...")
    response = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=headers)

    if response.status_code == 200:
        inquiries_data = response.json()
        print(f"✓ Admin inquiries endpoint successful")

        # Handle both response formats
        if isinstance(inquiries_data, dict) and "inquiries" in inquiries_data:
            inquiries = inquiries_data["inquiries"]
            print(f"  Found {len(inquiries)} inquiries (paginated response)")
        elif isinstance(inquiries_data, list):
            inquiries = inquiries_data
            print(f"  Found {len(inquiries)} inquiries (direct array response)")
        else:
            print(f"  Unexpected response format: {type(inquiries_data)}")

    else:
        print(f"✗ Admin inquiries failed: {response.status_code} - {response.text}")
        return None

    # Step 5: Test admin inquiries stats endpoint
    print("\n5. Testing /api/admin/inquiries/stats endpoint...")
    response = requests.get(f"{BASE_URL}/api/admin/inquiries/stats", headers=headers)

    if response.status_code == 200:
        stats_data = response.json()
        print(f"✓ Admin inquiries stats successful")
        print(f"  Total inquiries: {stats_data.get('total_inquiries', 0)}")
        print(f"  Unread messages: {stats_data.get('unread_messages', 0)}")
    else:
        print(
            f"✗ Admin inquiries stats failed: {response.status_code} - {response.text}"
        )

    return token


def main():
    print("Testing Admin Authentication Fix")
    print("=" * 50)

    try:
        token = test_authentication_flow()

        if token:
            print("\n" + "=" * 50)
            print("✅ All authentication tests passed!")
            print("The admin inquiry management system should now work correctly.")
            print("\nYou can now:")
            print("1. Visit http://localhost:3000/admin/inquiries")
            print("2. Login with your admin credentials")
            print("3. View and manage product inquiries")
        else:
            print("\n" + "=" * 50)
            print("❌ Authentication tests failed!")
            print(
                "Please check your admin credentials and ensure the backend is running."
            )

    except requests.exceptions.ConnectionError:
        print("❌ Connection failed!")
        print("Please ensure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()
