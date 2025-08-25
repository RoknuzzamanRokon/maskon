# Admin Notification System

This document describes the admin notification system implemented for product chat functionality.

## Overview

The admin notification system provides real-time and email notifications to administrators when:

- New product inquiries are created
- Urgent messages are received from customers
- Inquiries are assigned to specific admins
- High-priority inquiries require immediate attention

## Features

### 1. Real-time WebSocket Notifications

- Instant notifications to all connected admins
- Dedicated WebSocket endpoint for admin notifications
- Connection status monitoring
- Automatic cleanup of inactive connections

### 2. Email Notifications

- New inquiry notifications
- Urgent inquiry alerts
- Assignment notifications
- Configurable SMTP settings

### 3. Admin Dashboard Indicators

- Pending inquiry counts
- Unread message indicators
- Priority-based sorting
- Real-time status updates

### 4. Notification Types

- **New Inquiry**: When a customer starts a new chat session
- **Urgent Message**: When customer messages contain urgent keywords
- **Assignment**: When an inquiry is assigned to a specific admin
- **Priority Escalation**: When inquiries require immediate attention

## Configuration

### Email Configuration ✅ CONFIGURED

The email notification system is now configured and active:

```env
# Email Notification Configuration (ACTIVE)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=rokon.raz@gmail.com
SMTP_PASSWORD=xuqemoxazitnfcon
FROM_EMAIL=rokon.raz@gmail.com
ADMIN_EMAILS=rokon.raz@gmail.com
```

**Status**: ✅ Email notifications are fully functional and tested.  
**Note**: Using Gmail with App Password and SSL encryption (port 465).

### WebSocket Configuration

WebSocket notifications are enabled by default and require no additional configuration.

## API Endpoints

### Admin Notification Dashboard

```
GET /api/admin/notifications/dashboard
```

Returns pending inquiries, recent messages, and notification statistics.

### Notification Settings

```
GET /api/admin/notifications/settings
```

Returns current notification configuration and status.

### Test Email Notification

```
POST /api/admin/notifications/test-email
```

Sends a test email notification to verify configuration.

### Enhanced Inquiry Stats

```
GET /api/admin/inquiries/stats
```

Returns inquiry statistics with notification information.

## WebSocket Endpoints

### Admin Notifications

```
ws://localhost:8000/ws/admin/notifications/{admin_id}
```

Dedicated WebSocket connection for admin notifications.

### Admin Chat

```
ws://localhost:8000/ws/chat/admin/{admin_id}
```

General admin chat WebSocket connection.

## Usage

### Backend Integration

The notification service is automatically initialized when the FastAPI application starts:

```python
from utils.notification_service import get_notification_service
from websocket_manager import websocket_manager

# Initialize notification service
notification_service = get_notification_service(websocket_manager)
```

### Sending Notifications

Notifications are automatically sent when:

1. **New Chat Session Created**:

   ```python
   # Automatically triggered in create_chat_session endpoint
   await notification_service.notify_new_inquiry(inquiry_data, product_data)
   ```

2. **Urgent Message Detected**:

   ```python
   # Automatically triggered in send_chat_message endpoint
   await notification_service.notify_urgent_message(message_data, inquiry_data, product_data)
   ```

3. **Inquiry Assignment**:
   ```python
   # Automatically triggered in update_inquiry_status endpoint
   await notification_service.notify_inquiry_assigned(inquiry_data, product_data, admin_data)
   ```

### Frontend Integration

Use the `AdminNotificationDashboard` component:

```tsx
import AdminNotificationDashboard from "../components/AdminNotificationDashboard";

function AdminPage() {
  return (
    <AdminNotificationDashboard
      onInquirySelect={(inquiry) => {
        // Handle inquiry selection
        window.location.href = `/admin/inquiries?inquiry=${inquiry.id}`;
      }}
    />
  );
}
```

## Urgent Message Detection

The system automatically detects urgent messages based on keywords:

- "urgent", "emergency", "asap", "immediately", "critical"
- "help", "problem", "issue", "broken", "not working"
- "refund", "cancel", "complaint", "disappointed"

When detected, the system:

1. Sends real-time WebSocket notifications to all admins
2. Logs the urgent message for tracking
3. Can trigger email notifications if configured

## Testing

Run the notification system test:

```bash
cd backend
python test_notifications.py
```

This will test:

- Configuration status
- Email functionality (if configured)
- WebSocket manager
- Notification methods

## Monitoring

### Connection Stats

```python
stats = websocket_manager.get_connection_stats()
# Returns: total_connections, admin_connections, active_sessions
```

### Notification Stats

```python
stats = notification_service.get_notification_stats()
# Returns: email_configured, admin_emails_count, websocket_enabled
```

## Troubleshooting

### Email Not Working

1. Check SMTP configuration in `.env` file
2. Verify SMTP credentials
3. For Gmail, ensure App Password is used
4. Check firewall/network restrictions

### WebSocket Issues

1. Verify WebSocket endpoint is accessible
2. Check browser console for connection errors
3. Ensure proper authentication tokens

### Missing Notifications

1. Check notification service initialization
2. Verify WebSocket connections are active
3. Check server logs for errors

## Security Considerations

1. **Email Security**: Use App Passwords, not regular passwords
2. **WebSocket Authentication**: Ensure proper admin authentication
3. **Rate Limiting**: Prevent notification spam
4. **Data Sanitization**: All notification content is sanitized

## Performance

- WebSocket connections are automatically cleaned up
- Email notifications are sent asynchronously
- Database queries are optimized with proper indexing
- Connection pooling for WebSocket management

## Future Enhancements

1. **Push Notifications**: Browser push notifications
2. **SMS Notifications**: SMS alerts for critical inquiries
3. **Notification History**: Track and store notification history
4. **Custom Rules**: Admin-configurable notification rules
5. **Escalation Policies**: Automatic escalation based on response time
