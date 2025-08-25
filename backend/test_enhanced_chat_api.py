#!/usr/bin/env python3
"""
Test script for enhanced chat API endpoints
Tests validation, sanitization, and basic functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
PRODUCT_ID = 1  # Assuming product with ID 1 exists
SESSION_ID = f"test_session_{int(time.time())}"


def test_send_message():
    """Test sending a message with validation and sanitization"""
    print("Testing message sending with validation...")

    # Test 1: Valid message
    valid_message = {
        "message_text": "Hello, I have a question about this product.",
        "sender_type": "customer",
        "session_id": SESSION_ID,
    }

    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
        json=valid_message,
    )

    print(f"Valid message response: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")

    # Test 2: Message with HTML (should be sanitized)
    html_message = {
        "message_text": "This is a <script>alert('xss')</script> test message with <b>HTML</b>",
        "sender_type": "customer",
        "session_id": SESSION_ID,
    }

    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
        json=html_message,
    )

    print(f"HTML message response: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")

    # Test 3: Empty message (should fail)
    empty_message = {
        "message_text": "",
        "sender_type": "customer",
        "session_id": SESSION_ID,
    }

    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
        json=empty_message,
    )

    print(f"Empty message response: {response.status_code}")
    print(f"Error (expected): {response.text}")

    # Test 4: Very long message (should fail)
    long_message = {
        "message_text": "A" * 2001,  # Exceeds 2000 character limit
        "sender_type": "customer",
        "session_id": SESSION_ID,
    }

    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
        json=long_message,
    )

    print(f"Long message response: {response.status_code}")
    print(f"Error (expected): {response.text}")


def test_get_messages():
    """Test retrieving messages with validation"""
    print("\nTesting message retrieval...")

    # Test 1: Valid request
    response = requests.get(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages"
    )

    print(f"Get messages response: {response.status_code}")
    if response.status_code == 200:
        messages = response.json()
        print(f"Retrieved {len(messages)} messages")
        for msg in messages:
            print(f"  - {msg['sender_type']}: {msg['message_text'][:50]}...")
    else:
        print(f"Error: {response.text}")

    # Test 2: Invalid product ID
    response = requests.get(
        f"{BASE_URL}/api/products/-1/chat/sessions/{SESSION_ID}/messages"
    )

    print(f"Invalid product ID response: {response.status_code}")
    print(f"Error (expected): {response.text}")

    # Test 3: Invalid limit
    response = requests.get(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages?limit=150"
    )

    print(f"Invalid limit response: {response.status_code}")
    print(f"Error (expected): {response.text}")


def test_mark_messages_read():
    """Test marking messages as read"""
    print("\nTesting mark messages as read...")

    # First get messages to get their IDs
    response = requests.get(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages"
    )

    if response.status_code == 200:
        messages = response.json()
        if messages:
            message_ids = [
                msg["id"] for msg in messages[:2]
            ]  # Mark first 2 messages as read

            # Test marking specific messages as read
            response = requests.put(
                f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages/read",
                json={"message_ids": message_ids},
            )

            print(f"Mark specific messages response: {response.status_code}")
            if response.status_code == 200:
                print(f"Response: {response.json()}")
            else:
                print(f"Error: {response.text}")

        # Test marking all messages as read
        response = requests.put(
            f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages/read",
            json={"mark_all": True},
        )

        print(f"Mark all messages response: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")


def test_input_validation():
    """Test various input validation scenarios"""
    print("\nTesting input validation...")

    # Test invalid session ID characters
    invalid_session = "session with spaces and special chars!"
    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{invalid_session}/messages",
        json={"message_text": "Test message", "sender_type": "customer"},
    )

    print(f"Invalid session ID response: {response.status_code}")
    print(f"Error (expected): {response.text}")

    # Test invalid sender type
    response = requests.post(
        f"{BASE_URL}/api/products/{PRODUCT_ID}/chat/sessions/{SESSION_ID}/messages",
        json={"message_text": "Test message", "sender_type": "invalid_sender"},
    )

    print(f"Invalid sender type response: {response.status_code}")
    print(f"Error (expected): {response.text}")


if __name__ == "__main__":
    print("Enhanced Chat API Test Suite")
    print("=" * 40)

    try:
        test_send_message()
        test_get_messages()
        test_mark_messages_read()
        test_input_validation()

        print("\n" + "=" * 40)
        print("Test suite completed!")

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server.")
        print("Make sure the FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print(f"Unexpected error: {e}")
