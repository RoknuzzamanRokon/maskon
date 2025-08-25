#!/usr/bin/env python3
"""
Test WebSocket connection directly
"""

import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_websocket_direct():
    """Test WebSocket connection directly"""

    # Test the exact URL that's failing
    product_id = 11
    session_id = "session_1756109478972_cq28ac7jx_ORK5CYII"
    customer_name = "rrrrearfa"

    uri = f"ws://localhost:8000/ws/chat/customer/{product_id}/{session_id}?customer_name={customer_name}"

    print(f"🔗 Testing WebSocket connection to: {uri}")

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connection successful!")

            # Send a test message
            test_message = {
                "type": "chat_message",
                "message": "Test message",
                "sender_type": "customer",
                "sender_name": customer_name,
            }

            await websocket.send(json.dumps(test_message))
            print("✅ Test message sent")

            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print(f"✅ Received response: {response}")
            except asyncio.TimeoutError:
                print("ℹ️  No response received (this is normal)")

            return True

    except websockets.exceptions.InvalidURI as e:
        print(f"❌ Invalid WebSocket URI: {e}")
        return False
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"❌ WebSocket connection closed: {e}")
        return False
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ WebSocket invalid status code: {e}")
        print("   This usually means the endpoint returned HTTP instead of WebSocket")
        return False
    except ConnectionRefusedError as e:
        print(f"❌ Connection refused: {e}")
        print("   Make sure the server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False


async def test_http_endpoint():
    """Test if the HTTP endpoint exists (should return 404 or method not allowed)"""

    import aiohttp

    product_id = 11
    session_id = "session_1756109478972_cq28ac7jx_ORK5CYII"
    customer_name = "rrrrearfa"

    url = f"http://localhost:8000/ws/chat/customer/{product_id}/{session_id}?customer_name={customer_name}"

    print(f"\n🌐 Testing HTTP GET to WebSocket endpoint: {url}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                print(f"📊 HTTP Status: {response.status}")
                print(f"📋 Headers: {dict(response.headers)}")

                if response.status == 404:
                    print("❌ Endpoint not found (404)")
                elif response.status == 405:
                    print(
                        "✅ Method not allowed (405) - This is expected for WebSocket endpoints"
                    )
                elif response.status == 426:
                    print(
                        "✅ Upgrade required (426) - This is expected for WebSocket endpoints"
                    )
                else:
                    text = await response.text()
                    print(f"📄 Response: {text[:200]}...")

                return response.status

    except aiohttp.ClientConnectorError as e:
        print(f"❌ Cannot connect to server: {e}")
        return None
    except Exception as e:
        print(f"❌ HTTP test failed: {e}")
        return None


async def main():
    """Main test function"""
    print("🧪 WebSocket Connection Test")
    print("=" * 40)

    # Test HTTP endpoint first
    http_status = await test_http_endpoint()

    if http_status is None:
        print("\n❌ Server is not running or not accessible")
        print(
            "💡 Start the server with: uvicorn main:app --reload --host 0.0.0.0 --port 8000"
        )
        return False

    # Test WebSocket connection
    websocket_success = await test_websocket_direct()

    if websocket_success:
        print("\n🎉 WebSocket connection test PASSED!")
        print("💡 The WebSocket endpoint is working correctly.")
        print("💡 If the frontend is still having issues, check:")
        print("   1. Frontend WebSocket URL format")
        print("   2. CORS settings")
        print("   3. Browser console for errors")
    else:
        print("\n❌ WebSocket connection test FAILED!")
        print("💡 Possible issues:")
        print("   1. Server not running with WebSocket support")
        print("   2. WebSocket endpoint not properly registered")
        print("   3. Rate limiting or connection pool blocking")

    return websocket_success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
