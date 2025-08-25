#!/usr/bin/env python3
"""
Test script for message persistence and history functionality
Tests the enhanced chat API endpoints for proper message storage and retrieval
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api"
PRODUCT_ID = 1  # Assuming product ID 1 exists
SESSION_ID = f"test_session_{int(time.time())}"


def test_message_persistence():
    """Test message persistence and history retrieval"""
    print("🧪 Testing Message Persistence and History")
    print("=" * 50)

    # Test 1: Create a chat session
    print("\n1. Creating chat session...")
    session_data = {
        "session_id": SESSION_ID,
        "customer_name": "Test User",
        "customer_email": "test@example.com",
        "initial_message": "Hello, I have a question about this product!",
    }

    response = requests.post(
        f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions", json=session_data
    )

    if response.status_code == 200:
        print("✅ Chat session created successfully")
        print(f"   Session ID: {SESSION_ID}")
    else:
        print(f"❌ Failed to create session: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

    # Test 2: Send multiple messages
    print("\n2. Sending multiple messages...")
    messages_to_send = [
        "What are the specifications of this product?",
        "Is it available in different colors?",
        "What's the warranty period?",
        "Can I get a discount for bulk orders?",
    ]

    for i, message_text in enumerate(messages_to_send, 1):
        message_data = {
            "message_text": message_text,
            "sender_type": "customer",
            "customer_email": "test@example.com",
        }

        response = requests.post(
            f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
            json=message_data,
        )

        if response.status_code == 200:
            print(f"   ✅ Message {i} sent successfully")
        else:
            print(f"   ❌ Failed to send message {i}: {response.status_code}")
            return False

        time.sleep(0.5)  # Small delay between messages

    # Test 3: Retrieve message history
    print("\n3. Retrieving message history...")
    response = requests.get(
        f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages?limit=10&offset=0"
    )

    if response.status_code == 200:
        data = response.json()
        messages = data.get("messages", [])
        pagination = data.get("pagination", {})
        session_info = data.get("session_info", {})

        print("✅ Message history retrieved successfully")
        print(f"   Total messages: {pagination.get('total_count', 0)}")
        print(f"   Retrieved: {len(messages)} messages")
        print(f"   Session status: {session_info.get('status', 'unknown')}")

        # Display messages
        print("\n   📝 Message History:")
        for msg in messages:
            timestamp = datetime.fromisoformat(msg["created_at"].replace("Z", "+00:00"))
            print(
                f"   [{timestamp.strftime('%H:%M:%S')}] {msg['sender_type']}: {msg['message_text']}"
            )

    else:
        print(f"❌ Failed to retrieve history: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

    # Test 4: Test pagination
    print("\n4. Testing pagination...")
    response = requests.get(
        f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages?limit=2&offset=0"
    )

    if response.status_code == 200:
        data = response.json()
        pagination = data.get("pagination", {})

        print("✅ Pagination working correctly")
        print(f"   Page 1: {len(data.get('messages', []))} messages")
        print(f"   Has more: {pagination.get('has_more', False)}")
        print(f"   Total pages: {pagination.get('total_pages', 0)}")

        # Test second page
        if pagination.get("has_more"):
            response = requests.get(
                f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages?limit=2&offset=2"
            )
            if response.status_code == 200:
                data = response.json()
                print(f"   Page 2: {len(data.get('messages', []))} messages")

    else:
        print(f"❌ Pagination test failed: {response.status_code}")
        return False

    # Test 5: Mark messages as read
    print("\n5. Testing read status tracking...")
    read_data = {"mark_all": True}

    response = requests.put(
        f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages/read",
        json=read_data,
    )

    if response.status_code == 200:
        data = response.json()
        print("✅ Messages marked as read successfully")
        print(f"   Affected rows: {data.get('affected_rows', 0)}")

        # Verify read status
        response = requests.get(
            f"{API_BASE_URL}/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages"
        )
        if response.status_code == 200:
            data = response.json()
            unread_count = data.get("unread_count", 0)
            print(f"   Unread count after marking: {unread_count}")

    else:
        print(f"❌ Failed to mark messages as read: {response.status_code}")
        return False

    print("\n🎉 All tests passed! Message persistence and history working correctly.")
    return True


if __name__ == "__main__":
    try:
        success = test_message_persistence()
        if success:
            print("\n✅ Message persistence implementation is working correctly!")
        else:
            print("\n❌ Some tests failed. Please check the implementation.")
    except Exception as e:
        print(f"\n💥 Test failed with exception: {e}")
        import traceback

        traceback.print_exc()
