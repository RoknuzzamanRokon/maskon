#!/usr/bin/env python3
"""
Quick test script to verify the new admin endpoints are working
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "admin"  # Replace with your admin username
TEST_PASSWORD = "admin123"  # Replace with your admin password


def test_admin_endpoints():
    """Test the new admin endpoints"""

    # First, login to get a token
    print("🔐 Testing admin login...")
    login_response = requests.post(
        f"{BASE_URL}/api/login",
        json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
    )

    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return False

    token_data = login_response.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print(f"✅ Login successful! Token: {token[:20]}...")

    # Test notifications endpoint
    print("\n📢 Testing /api/admin/notifications...")
    notifications_response = requests.get(
        f"{BASE_URL}/api/admin/notifications", headers=headers
    )

    if notifications_response.status_code == 200:
        print("✅ Notifications endpoint working!")
        notifications_data = notifications_response.json()
        print(f"   Total notifications: {notifications_data.get('total_count', 0)}")
        print(f"   Unread count: {notifications_data.get('unread_count', 0)}")
    else:
        print(f"❌ Notifications endpoint failed: {notifications_response.status_code}")
        print(f"Response: {notifications_response.text}")

    # Test settings endpoint
    print("\n⚙️  Testing /api/admin/settings...")
    settings_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=headers)

    if settings_response.status_code == 200:
        print("✅ Settings endpoint working!")
        settings_data = settings_response.json()
        print(f"   Admin: {settings_data.get('admin_info', {}).get('username', 'N/A')}")
        print(
            f"   Total posts: {settings_data.get('system_stats', {}).get('total_posts', 0)}"
        )
        print(
            f"   Total products: {settings_data.get('system_stats', {}).get('total_products', 0)}"
        )
    else:
        print(f"❌ Settings endpoint failed: {settings_response.status_code}")
        print(f"Response: {settings_response.text}")

    print("\n🎉 Admin endpoints test completed!")
    return True


if __name__ == "__main__":
    print("🚀 Testing new admin endpoints...")
    print("Make sure the backend server is running on http://localhost:8000")
    print("=" * 60)

    try:
        test_admin_endpoints()
    except requests.exceptions.ConnectionError:
        print(
            "❌ Could not connect to the server. Make sure it's running on http://localhost:8000"
        )
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
