"""
Comprehensive Test Runner for Chat Functionality

Runs all chat-related tests and generates a comprehensive report.
Tests all requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3
"""

import pytest
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def run_chat_tests():
    """Run all chat-related tests with comprehensive reporting"""

    # Test files to run
    test_files = [
        "tests/test_chat_api.py",
        "tests/test_admin_chat.py",
        "tests/test_chat_integration.py",
        "tests/test_websocket.py",
        "tests/test_websocket_enhanced.py",
        "tests/test_websocket_integration.py",
    ]

    # Test configuration
    pytest_args = [
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        "--strict-markers",  # Strict marker checking
        "--disable-warnings",  # Disable warnings for cleaner output
        "-x",  # Stop on first failure (remove this for full test run)
        "--durations=10",  # Show 10 slowest tests
    ] + test_files

    print("=" * 80)
    print("RUNNING COMPREHENSIVE CHAT FUNCTIONALITY TESTS")
    print("=" * 80)
    print()
    print("Test Coverage:")
    print("- Message API Endpoints (Requirements 1.3, 2.1, 4.2)")
    print("- WebSocket Real-time Communication (Requirements 1.4, 3.3)")
    print("- Admin Inquiry Management (Requirements 3.1, 3.2, 3.4)")
    print("- Complete Chat Integration Flow (Requirements 1.1, 2.2, 2.3)")
    print("- Product Association (Requirements 4.1, 4.3)")
    print()
    print("=" * 80)

    # Run the tests
    exit_code = pytest.main(pytest_args)

    print()
    print("=" * 80)
    print("TEST EXECUTION COMPLETED")
    print("=" * 80)

    if exit_code == 0:
        print("✅ ALL TESTS PASSED!")
        print()
        print("Requirements Validation Status:")
        print("✅ Requirement 1.1 - Chat widget on product pages")
        print("✅ Requirement 1.3 - Message storage with product context")
        print("✅ Requirement 1.4 - Real-time chat interface")
        print("✅ Requirement 2.1 - Chat history persistence")
        print("✅ Requirement 2.2 - Chronological message display")
        print("✅ Requirement 2.3 - Welcome message handling")
        print("✅ Requirement 3.1 - Admin notification system")
        print("✅ Requirement 3.2 - Admin inquiry panel")
        print("✅ Requirement 3.3 - Real-time admin responses")
        print("✅ Requirement 3.4 - Product context in admin view")
        print("✅ Requirement 4.1 - Product-chat association")
        print("✅ Requirement 4.2 - Product ID in message data")
        print("✅ Requirement 4.3 - Product-filtered chat history")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Please review the test output above for details.")

    return exit_code


def run_specific_test_category(category):
    """Run tests for a specific category"""

    category_files = {
        "api": ["tests/test_chat_api.py"],
        "admin": ["tests/test_admin_chat.py"],
        "websocket": [
            "tests/test_websocket.py",
            "tests/test_websocket_enhanced.py",
            "tests/test_websocket_integration.py",
        ],
        "integration": ["tests/test_chat_integration.py"],
    }

    if category not in category_files:
        print(f"Unknown category: {category}")
        print(f"Available categories: {', '.join(category_files.keys())}")
        return 1

    test_files = category_files[category]

    pytest_args = [
        "-v",
        "--tb=short",
        "--disable-warnings",
    ] + test_files

    print(f"Running {category.upper()} tests...")
    return pytest.main(pytest_args)


def run_performance_tests():
    """Run performance-focused tests"""

    pytest_args = [
        "-v",
        "--tb=short",
        "-k",
        "concurrent or performance or load",  # Run tests with these keywords
        "tests/",
    ]

    print("Running performance tests...")
    return pytest.main(pytest_args)


def run_security_tests():
    """Run security-focused tests"""

    pytest_args = [
        "-v",
        "--tb=short",
        "-k",
        "sanitization or validation or xss or security",  # Run security tests
        "tests/",
    ]

    print("Running security tests...")
    return pytest.main(pytest_args)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run chat functionality tests")
    parser.add_argument(
        "--category",
        choices=["api", "admin", "websocket", "integration", "performance", "security"],
        help="Run tests for a specific category",
    )
    parser.add_argument(
        "--all", action="store_true", help="Run all chat tests (default)"
    )

    args = parser.parse_args()

    if args.category == "performance":
        exit_code = run_performance_tests()
    elif args.category == "security":
        exit_code = run_security_tests()
    elif args.category:
        exit_code = run_specific_test_category(args.category)
    else:
        exit_code = run_chat_tests()

    sys.exit(exit_code)
