#!/usr/bin/env python3
"""
Test API endpoints to verify Azure database integration
"""

import requests
import json
from datetime import datetime


def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Database: {data.get('database')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False


def test_posts_endpoint():
    """Test the posts endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/posts", timeout=5)
        if response.status_code == 200:
            posts = response.json()
            print(f"✅ Posts endpoint working - found {len(posts)} posts")
            for post in posts[:3]:  # Show first 3 posts
                print(f"   - {post['title']} ({post['category']})")
            return True
        else:
            print(f"❌ Posts endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Posts endpoint failed: {e}")
        return False


def test_login_endpoint():
    """Test the login endpoint with admin credentials"""
    try:
        login_data = {"username": "mashkon", "password": "mashkon123"}

        response = requests.post(
            "http://localhost:8000/api/login", json=login_data, timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            print("✅ Login endpoint working")
            print(f"   Username: {data.get('username')}")
            print(f"   Is Admin: {data.get('is_admin')}")
            return True, data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ Login endpoint failed: {e}")
        return False, None


def main():
    """Run all API tests"""
    print("🧪 Testing API with Azure Database")
    print("=" * 50)

    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    health_ok = test_health_endpoint()

    # Test 2: Posts endpoint
    print("\n2. Testing posts endpoint...")
    posts_ok = test_posts_endpoint()

    # Test 3: Login endpoint
    print("\n3. Testing login endpoint...")
    login_ok, token = test_login_endpoint()

    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Posts API: {'✅ PASS' if posts_ok else '❌ FAIL'}")
    print(f"   Login API: {'✅ PASS' if login_ok else '❌ FAIL'}")

    if all([health_ok, posts_ok, login_ok]):
        print("\n🎉 All tests passed! Your API is working with Azure database.")
        print("\n🚀 Ready to use:")
        print("   - API Base URL: http://localhost:8000")
        print("   - API Docs: http://localhost:8000/docs")
        print("   - Admin Login: mashkon / mashkon123")
    else:
        print("\n⚠️  Some tests failed. Check the server is running on port 8000.")
        print("   Start server: python -m uvicorn main:app --reload")


if __name__ == "__main__":
    main()
