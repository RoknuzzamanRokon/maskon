#!/usr/bin/env python3
"""
Test WebSocket connection to verify the fix
"""

import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_websocket_connection():
    """Test WebSocket connection to the chat endpoint"""

    # Test parameters
    product_id = 11
    session_id = "test_session_123"
    customer_name = "TestUser"

    uri = f"ws://localhost:8000/ws/chat/customer/{product_id}/{session_id}?customer_name={customer_name}"

    try:
        logger.info(f"Attempting to connect to: {uri}")

        async with websockets.connect(uri) as websocket:
            logger.info("✓ WebSocket connection successful!")

            # Send a test message
            test_message = {
                "type": "chat_message",
                "message": "Hello, this is a test message",
                "sender_type": "customer",
                "sender_name": customer_name,
            }

            await websocket.send(json.dumps(test_message))
            logger.info("✓ Test message sent")

            # Wait for a response or timeout
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                logger.info(f"✓ Received response: {response}")
            except asyncio.TimeoutError:
                logger.info("No response received (this is normal for test)")

            logger.info("✓ WebSocket test completed successfully")

    except websockets.exceptions.ConnectionClosedError as e:
        logger.error(f"✗ WebSocket connection closed: {e}")
        return False
    except websockets.exceptions.InvalidStatusCode as e:
        logger.error(f"✗ WebSocket invalid status code: {e}")
        return False
    except Exception as e:
        logger.error(f"✗ WebSocket connection failed: {e}")
        return False

    return True


async def test_multiple_connections():
    """Test multiple WebSocket connections to check rate limiting"""

    logger.info("Testing multiple WebSocket connections...")

    tasks = []
    for i in range(5):  # Test 5 concurrent connections
        session_id = f"test_session_{i}"
        customer_name = f"TestUser{i}"

        task = test_single_connection(11, session_id, customer_name)
        tasks.append(task)

    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = sum(1 for result in results if result is True)
    logger.info(f"✓ {successful}/5 connections successful")

    return successful >= 3  # At least 3 should succeed


async def test_single_connection(product_id, session_id, customer_name):
    """Test a single WebSocket connection"""

    uri = f"ws://localhost:8000/ws/chat/customer/{product_id}/{session_id}?customer_name={customer_name}"

    try:
        async with websockets.connect(uri) as websocket:
            # Just connect and disconnect
            await asyncio.sleep(0.1)
            return True
    except Exception as e:
        logger.warning(f"Connection failed for {session_id}: {e}")
        return False


async def main():
    """Main test function"""
    logger.info("Starting WebSocket connection tests...")

    # Test single connection
    single_test = await test_websocket_connection()

    # Test multiple connections
    multiple_test = await test_multiple_connections()

    if single_test and multiple_test:
        logger.info("🎉 All WebSocket tests passed!")
        return True
    else:
        logger.error("❌ Some WebSocket tests failed")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
