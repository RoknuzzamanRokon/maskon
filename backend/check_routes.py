#!/usr/bin/env python3
"""
Check if WebSocket routes are properly registered
"""

from main import app


def check_websocket_routes():
    """Check if WebSocket routes are registered"""

    print("🔍 Checking FastAPI routes...")

    websocket_routes = []
    http_routes = []

    for route in app.routes:
        if hasattr(route, "path"):
            route_info = f"{route.path}"

            # Check if it's a WebSocket route
            if hasattr(route, "endpoint") and hasattr(route.endpoint, "__name__"):
                if "websocket" in route.endpoint.__name__.lower():
                    websocket_routes.append(f"WebSocket: {route.path}")
                else:
                    if hasattr(route, "methods"):
                        methods = ", ".join(route.methods)
                        http_routes.append(f"{methods}: {route.path}")

    print(f"\n📡 WebSocket routes found ({len(websocket_routes)}):")
    for route in websocket_routes:
        print(f"  ✓ {route}")

    print(f"\n🌐 HTTP routes with /ws/ pattern:")
    ws_http_routes = [r for r in http_routes if "/ws/" in r]
    for route in ws_http_routes:
        print(f"  ⚠️  {route}")

    if not websocket_routes and not ws_http_routes:
        print("❌ No WebSocket routes found!")
        return False

    # Check specific route we need
    customer_chat_route = "/ws/chat/customer/{product_id}/{session_id}"
    found_customer_route = any(
        customer_chat_route in route for route in websocket_routes
    )

    if found_customer_route:
        print(f"\n✅ Customer chat WebSocket route found: {customer_chat_route}")
    else:
        print(f"\n❌ Customer chat WebSocket route NOT found: {customer_chat_route}")

    return len(websocket_routes) > 0


def check_imports():
    """Check if all required imports are working"""

    print("\n🔍 Checking imports...")

    try:
        from websocket_manager import websocket_manager, ConnectionType, MessageType

        print("✅ WebSocket manager imported successfully")
    except Exception as e:
        print(f"❌ WebSocket manager import failed: {e}")
        return False

    try:
        from utils.rate_limiter import chat_rate_limiter

        print("✅ Rate limiter imported successfully")
    except Exception as e:
        print(f"❌ Rate limiter import failed: {e}")
        return False

    try:
        from utils.connection_pool import connection_pool

        print("✅ Connection pool imported successfully")
    except Exception as e:
        print(f"❌ Connection pool import failed: {e}")
        return False

    return True


def main():
    """Main check function"""
    print("🚀 FastAPI WebSocket Route Checker")
    print("=" * 40)

    imports_ok = check_imports()
    routes_ok = check_websocket_routes()

    if imports_ok and routes_ok:
        print("\n🎉 All checks passed! WebSocket should work.")
        print("\n💡 If you're still getting 404 errors:")
        print("  1. Make sure the server is running with: uvicorn main:app --reload")
        print("  2. Check that the frontend is connecting to the right URL")
        print("  3. Verify the WebSocket URL format matches the route pattern")
    else:
        print("\n❌ Some checks failed. WebSocket may not work properly.")

    return imports_ok and routes_ok


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
