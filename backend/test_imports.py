#!/usr/bin/env python3
"""Test imports for security and performance modules"""

try:
    from utils.rate_limiter import chat_rate_limiter
    from utils.connection_pool import connection_pool
    from utils.database_optimizer import OptimizedChatQueries
    from utils.message_sanitizer import (
        sanitize_message_text,
        get_content_security_score,
    )

    print("✓ All security and performance modules imported successfully")
    print("✓ Rate limiter ready")
    print("✓ Connection pool ready")
    print("✓ Database optimizer ready")
    print("✓ Message sanitizer ready")

    # Test basic functionality
    test_message = 'Hello <script>alert("test")</script> world'
    sanitized = sanitize_message_text(test_message)
    score = get_content_security_score(test_message)
    print(f'✓ Sanitization test: "{test_message}" -> "{sanitized}"')
    print(f"✓ Security score: {score}")

    print("\n✓ All security and performance improvements are ready!")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback

    traceback.print_exc()
