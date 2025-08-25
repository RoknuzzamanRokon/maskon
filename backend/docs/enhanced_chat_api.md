# Enhanced Chat API Documentation

## Overview

The enhanced chat API provides secure, validated endpoints for product-specific chat functionality. All endpoints include comprehensive input validation, message sanitization, and XSS protection.

## Security Features

### Message Sanitization

- HTML escaping to prevent XSS attacks
- Script tag removal
- JavaScript URL filtering
- Event handler attribute removal
- Content length validation
- Spam/abuse detection for customer messages

### Input Validation

- Product ID validation (must be positive integer)
- Session ID format validation (alphanumeric, hyphens, underscores only)
- Email format validation
- Message length limits (2000 characters)
- Rate limiting indicators

## API Endpoints

### 1. Send Message

**Endpoint:** `POST /api/products/{product_id}/chat/sessions/{session_id}/messages`

**Description:** Send a message in a product chat session with enhanced validation and sanitization.

**Parameters:**

- `product_id` (path): Product ID (must be positive integer)
- `session_id` (path): Chat session ID (alphanumeric, hyphens, underscores only)

**Request Body:**

```json
{
  "message_text": "Your message here",
  "sender_type": "customer|admin",
  "sender_name": "Optional sender name",
  "session_id": "Optional session ID for new sessions",
  "customer_email": "Optional customer email"
}
```

**Validation Rules:**

- `message_text`: Required, 1-2000 characters, HTML escaped, script tags removed
- `sender_type`: Must be "customer" or "admin"
- `sender_name`: Optional, max 255 characters, special characters removed
- `customer_email`: Optional, must be valid email format if provided

**Response:**

```json
{
  "message": "Message sent successfully",
  "message_id": 123,
  "session_id": "chat_1234567890_abcd1234",
  "sanitized": true
}
```

**Error Responses:**

- `400`: Invalid input (empty message, invalid format, etc.)
- `404`: Product or session not found
- `429`: Message flagged for potential spam/abuse

### 2. Get Messages

**Endpoint:** `GET /api/products/{product_id}/chat/sessions/{session_id}/messages`

**Description:** Retrieve messages for a chat session with validation.

**Parameters:**

- `product_id` (path): Product ID (must be positive integer)
- `session_id` (path): Chat session ID
- `limit` (query): Number of messages to retrieve (1-100, default: 50)

**Response:**

```json
[
  {
    "id": 1,
    "session_id": 123,
    "sender_type": "customer",
    "sender_id": null,
    "sender_name": "Customer",
    "message_text": "Hello, I have a question about this product.",
    "message_type": "text",
    "is_read": false,
    "created_at": "2024-01-01T12:00:00",
    "updated_at": "2024-01-01T12:00:00"
  }
]
```

**Error Responses:**

- `400`: Invalid product ID, session ID, or limit
- `404`: Product or session not found

### 3. Mark Messages as Read

**Endpoint:** `PUT /api/products/{product_id}/chat/sessions/{session_id}/messages/read`

**Description:** Mark messages as read in a chat session.

**Parameters:**

- `product_id` (path): Product ID (must be positive integer)
- `session_id` (path): Chat session ID

**Request Body (Option 1 - Specific Messages):**

```json
{
  "message_ids": [1, 2, 3]
}
```

**Request Body (Option 2 - All Messages):**

```json
{
  "mark_all": true
}
```

**Validation Rules:**

- `message_ids`: Optional array of positive integers, max 100 items
- `mark_all`: Boolean, if true marks all messages in session as read
- Must provide either `message_ids` or `mark_all: true`

**Response:**

```json
{
  "message": "Marked 3 messages as read",
  "affected_rows": 3,
  "session_id": "chat_1234567890_abcd1234"
}
```

**Error Responses:**

- `400`: Invalid input, too many message IDs, or missing required fields
- `404`: Product or session not found

## Enhanced Models

### MessageCreate

```python
class MessageCreate(BaseModel):
    message_text: str = Field(..., min_length=1, max_length=2000)
    sender_type: Literal["customer", "admin"]
    session_id: Optional[str] = None
    customer_email: Optional[str] = None

    # Automatic validation and sanitization applied
```

### ProductMessage

```python
class ProductMessage(BaseModel):
    id: int
    session_id: int
    sender_type: str
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    message_text: str
    message_type: str = "text"
    is_read: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
```

## Sanitization Examples

### Input Sanitization

```python
# Input: "Hello <script>alert('xss')</script> world!"
# Output: "Hello  world!"

# Input: "Check out javascript:alert('hack') this link"
# Output: "Check out  this link"

# Input: "Click <a onclick='hack()'>here</a>"
# Output: "Click here"
```

### Validation Examples

```python
# Valid email: "user@example.com" -> "user@example.com"
# Invalid email: "invalid-email" -> ValueError

# Valid session ID: "chat_123_abc" -> "chat_123_abc"
# Invalid session ID: "session with spaces" -> ValueError

# Valid message: "Hello world" -> "Hello world"
# Invalid message: "" -> ValueError
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Descriptive error message"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation error)
- `404`: Not Found (product/session not found)
- `429`: Too Many Requests (rate limited/spam detected)
- `500`: Internal Server Error

## Rate Limiting and Abuse Detection

The API includes basic abuse detection for customer messages:

- **Repetitive Content**: Messages with less than 30% unique words are flagged
- **Excessive Capitalization**: Messages with more than 70% capital letters are flagged
- **Suspicious Patterns**: URLs, promotional language, and money-related terms are flagged
- **Flagged Messages**: Return HTTP 429 with appropriate error message

## Database Schema Compatibility

The enhanced API is compatible with the existing database schema:

- `product_chat_sessions` table
- `product_chat_messages` table

No schema changes are required for the enhanced validation and sanitization features.

## Testing

Use the provided test script to verify functionality:

```bash
cd backend
python test_enhanced_chat_api.py
```

The test script covers:

- Message sending with various inputs
- HTML/XSS sanitization
- Input validation
- Message retrieval
- Mark as read functionality
- Error handling

## Dependencies

Additional dependencies required:

- `bleach==6.1.0` - For HTML sanitization

Install with:

```bash
pip install bleach==6.1.0
```

## Migration from Basic API

The enhanced API is backward compatible with existing chat functionality. Key improvements:

1. **Enhanced Security**: XSS protection and input sanitization
2. **Better Validation**: Comprehensive input validation with clear error messages
3. **Improved Error Handling**: Consistent error responses and logging
4. **Rate Limiting**: Basic spam/abuse detection
5. **Better Documentation**: Clear API documentation and examples

Existing clients should continue to work without changes, but will benefit from the enhanced security and validation.
