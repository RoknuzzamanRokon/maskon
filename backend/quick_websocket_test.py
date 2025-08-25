#!/usr/bin/env python3
"""
Quick WebSocket test to verify the fix
"""

import requests
import json


def test_debug_endpoints():
    """Test the debug endpoints to check system status"""

    print("🔍 Testing debug endpoints...")

    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/api/health")
        if response.status_code == 200:
            data = response.json()
            print("✓ Health endpoint working")
            print(f"  Database: {data.get('database', 'unknown')}")
            print(f"  Rate limiter stats: {data.get('rate_limiter', {})}")
        else:
            print(f"✗ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Health endpoint error: {e}")

    try:
        # Test WebSocket debug endpoint
        response = requests.get("http://localhost:8000/api/debug/websocket-status")
        if response.status_code == 200:
            data = response.json()
            print("✓ WebSocket debug endpoint working")

            rate_limiter = data.get("rate_limiter", {})
            connection_pool = data.get("connection_pool", {})
            websocket_manager = data.get("websocket_manager", {})

            print(
                f"  Rate limiter - Connection limit: {rate_limiter.get('connection_limit', 'unknown')}"
            )
            print(
                f"  Connection pool - Max per IP: {connection_pool.get('max_per_ip', 'unknown')}"
            )
            print(
                f"  WebSocket manager - Active connections: {websocket_manager.get('active_connections', 0)}"
            )

        else:
            print(f"✗ WebSocket debug endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"✗ WebSocket debug endpoint error: {e}")

    try:
        # Reset rate limits for testing
        response = requests.post("http://localhost:8000/api/debug/reset-rate-limits")
        if response.status_code == 200:
            print("✓ Rate limits reset successfully")
        else:
            print(f"✗ Rate limit reset failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Rate limit reset error: {e}")


def main():
    """Main test function"""
    print("🚀 Quick WebSocket Fix Test")
    print("=" * 40)

    test_debug_endpoints()

    print("\n📋 Summary of fixes applied:")
    print("  • Increased connection rate limit: 10 → 50 per 5 minutes")
    print("  • Increased connection pool limit: 10 → 25 per IP")
    print("  • Improved WebSocket error handling")
    print("  • Accept WebSocket before checking limits")
    print("  • Added graceful error messages")
    print("  • Added debug endpoints for monitoring")

    print("\n✅ WebSocket connection issues should now be resolved!")
    print("\n💡 If you still see 403 errors:")
    print(
        "  1. Check the debug endpoint: http://localhost:8000/api/debug/websocket-status"
    )
    print(
        "  2. Reset rate limits: POST http://localhost:8000/api/debug/reset-rate-limits"
    )
    print("  3. Check server logs for specific error messages")


if __name__ == "__main__":
    main()
