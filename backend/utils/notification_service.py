"""
Admin Notification Service

This module handles notifications for admins when new product inquiries are created
or when urgent inquiries require immediate attention.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv
import asyncio
from enum import Enum

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationType(Enum):
    NEW_INQUIRY = "new_inquiry"
    URGENT_INQUIRY = "urgent_inquiry"
    INQUIRY_ASSIGNED = "inquiry_assigned"
    INQUIRY_RESOLVED = "inquiry_resolved"


class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class EmailNotificationService:
    """Service for sending email notifications to admins"""

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.admin_emails = self._get_admin_emails()

        # Check if email is configured
        self.is_configured = bool(self.smtp_username and self.smtp_password)

        if not self.is_configured:
            logger.warning(
                "Email notifications not configured. Set SMTP_USERNAME and SMTP_PASSWORD environment variables."
            )

    def _get_admin_emails(self) -> List[str]:
        """Get admin email addresses from environment or database"""
        admin_emails_env = os.getenv("ADMIN_EMAILS", "")
        if admin_emails_env:
            return [
                email.strip() for email in admin_emails_env.split(",") if email.strip()
            ]
        return []

    async def send_new_inquiry_notification(
        self, inquiry_data: Dict[str, Any], product_data: Dict[str, Any]
    ) -> bool:
        """Send notification for new product inquiry"""
        if not self.is_configured or not self.admin_emails:
            logger.info("Email not configured or no admin emails found")
            return False

        subject = f"New Product Inquiry - {product_data.get('name', 'Unknown Product')}"

        html_body = f"""
        <html>
        <body>
            <h2>New Product Inquiry</h2>
            <p>A new inquiry has been received for one of your products.</p>
            
            <h3>Product Details:</h3>
            <ul>
                <li><strong>Product:</strong> {product_data.get('name', 'N/A')}</li>
                <li><strong>Price:</strong> ${product_data.get('price', 'N/A')}</li>
                <li><strong>Category:</strong> {product_data.get('category', 'N/A')}</li>
            </ul>
            
            <h3>Customer Information:</h3>
            <ul>
                <li><strong>Name:</strong> {inquiry_data.get('customer_name', 'Anonymous')}</li>
                <li><strong>Email:</strong> {inquiry_data.get('customer_email', 'Not provided')}</li>
                <li><strong>Session ID:</strong> {inquiry_data.get('session_id', 'N/A')}</li>
            </ul>
            
            <h3>Initial Message:</h3>
            <p>{inquiry_data.get('initial_message', 'No initial message')}</p>
            
            <p><strong>Priority:</strong> {inquiry_data.get('priority', 'medium').upper()}</p>
            <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
            
            <p>Please log in to the admin panel to respond to this inquiry.</p>
        </body>
        </html>
        """

        return await self._send_email(subject, html_body, self.admin_emails)

    async def send_urgent_inquiry_notification(
        self, inquiry_data: Dict[str, Any], product_data: Dict[str, Any]
    ) -> bool:
        """Send urgent notification for high-priority inquiries"""
        if not self.is_configured or not self.admin_emails:
            return False

        subject = f"🚨 URGENT: Product Inquiry - {product_data.get('name', 'Unknown Product')}"

        html_body = f"""
        <html>
        <body>
            <h2 style="color: red;">🚨 URGENT PRODUCT INQUIRY</h2>
            <p style="color: red; font-weight: bold;">This inquiry requires immediate attention!</p>
            
            <h3>Product Details:</h3>
            <ul>
                <li><strong>Product:</strong> {product_data.get('name', 'N/A')}</li>
                <li><strong>Price:</strong> ${product_data.get('price', 'N/A')}</li>
                <li><strong>Category:</strong> {product_data.get('category', 'N/A')}</li>
            </ul>
            
            <h3>Customer Information:</h3>
            <ul>
                <li><strong>Name:</strong> {inquiry_data.get('customer_name', 'Anonymous')}</li>
                <li><strong>Email:</strong> {inquiry_data.get('customer_email', 'Not provided')}</li>
                <li><strong>Session ID:</strong> {inquiry_data.get('session_id', 'N/A')}</li>
            </ul>
            
            <h3>Message:</h3>
            <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">
                {inquiry_data.get('message', 'No message')}
            </p>
            
            <p><strong style="color: red;">Priority: URGENT</strong></p>
            <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
            
            <p style="color: red; font-weight: bold;">
                Please respond to this inquiry immediately!
            </p>
        </body>
        </html>
        """

        return await self._send_email(subject, html_body, self.admin_emails)

    async def send_inquiry_assigned_notification(
        self,
        inquiry_data: Dict[str, Any],
        product_data: Dict[str, Any],
        admin_email: str,
        admin_name: str,
    ) -> bool:
        """Send notification when inquiry is assigned to specific admin"""
        if not self.is_configured:
            return False

        subject = f"Inquiry Assigned - {product_data.get('name', 'Unknown Product')}"

        html_body = f"""
        <html>
        <body>
            <h2>Product Inquiry Assigned to You</h2>
            <p>Hello {admin_name},</p>
            <p>A product inquiry has been assigned to you.</p>
            
            <h3>Product Details:</h3>
            <ul>
                <li><strong>Product:</strong> {product_data.get('name', 'N/A')}</li>
                <li><strong>Price:</strong> ${product_data.get('price', 'N/A')}</li>
            </ul>
            
            <h3>Customer Information:</h3>
            <ul>
                <li><strong>Name:</strong> {inquiry_data.get('customer_name', 'Anonymous')}</li>
                <li><strong>Email:</strong> {inquiry_data.get('customer_email', 'Not provided')}</li>
            </ul>
            
            <p><strong>Priority:</strong> {inquiry_data.get('priority', 'medium').upper()}</p>
            <p><strong>Status:</strong> {inquiry_data.get('status', 'pending').upper()}</p>
            
            <p>Please log in to the admin panel to respond to this inquiry.</p>
        </body>
        </html>
        """

        return await self._send_email(subject, html_body, [admin_email])

    async def _send_email(
        self, subject: str, html_body: str, recipients: List[str]
    ) -> bool:
        """Send email using SMTP"""
        if not recipients:
            logger.warning("No recipients provided for email notification")
            return False

        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = ", ".join(recipients)

            # Create HTML part
            html_part = MIMEText(html_body, "html")
            msg.attach(html_part)

            # Send email - handle both SSL and TLS
            if self.smtp_port == 465:
                # Use SSL for port 465
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
            else:
                # Use TLS for other ports (like 587)
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)

            logger.info(f"Email notification sent to {len(recipients)} recipients")
            return True

        except Exception as e:
            logger.error(f"Failed to send email notification: {e}")
            return False


class AdminNotificationService:
    """Main service for handling admin notifications"""

    def __init__(self, websocket_manager=None):
        self.email_service = EmailNotificationService()
        self.websocket_manager = websocket_manager
        self.notification_queue = []

    async def notify_new_inquiry(
        self, inquiry_data: Dict[str, Any], product_data: Dict[str, Any]
    ):
        """Send notifications for new product inquiry"""
        try:
            # Send real-time WebSocket notification to all admins
            if self.websocket_manager:
                await self._send_websocket_notification(
                    {
                        "type": "new_inquiry",
                        "inquiry_id": inquiry_data.get("id"),
                        "session_id": inquiry_data.get("session_id"),
                        "product_id": product_data.get("id"),
                        "product_name": product_data.get("name"),
                        "customer_name": inquiry_data.get("customer_name", "Anonymous"),
                        "priority": inquiry_data.get("priority", "medium"),
                        "message": inquiry_data.get("initial_message", ""),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

            # Send email notification for medium/high priority inquiries
            priority = inquiry_data.get("priority", "medium")
            if priority in ["medium", "high", "urgent"]:
                await self.email_service.send_new_inquiry_notification(
                    inquiry_data, product_data
                )

            # Send urgent email for high priority inquiries
            if priority in ["high", "urgent"]:
                await self.email_service.send_urgent_inquiry_notification(
                    inquiry_data, product_data
                )

            logger.info(f"Notifications sent for new inquiry {inquiry_data.get('id')}")

        except Exception as e:
            logger.error(f"Failed to send new inquiry notifications: {e}")

    async def notify_inquiry_assigned(
        self,
        inquiry_data: Dict[str, Any],
        product_data: Dict[str, Any],
        admin_data: Dict[str, Any],
    ):
        """Send notification when inquiry is assigned to admin"""
        try:
            # Send WebSocket notification to the assigned admin
            if self.websocket_manager:
                await self._send_websocket_notification(
                    {
                        "type": "inquiry_assigned",
                        "inquiry_id": inquiry_data.get("id"),
                        "session_id": inquiry_data.get("session_id"),
                        "product_name": product_data.get("name"),
                        "assigned_admin_id": admin_data.get("id"),
                        "assigned_admin_name": admin_data.get("username"),
                        "priority": inquiry_data.get("priority", "medium"),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

            # Send email notification to assigned admin
            if admin_data.get("email"):
                await self.email_service.send_inquiry_assigned_notification(
                    inquiry_data,
                    product_data,
                    admin_data.get("email"),
                    admin_data.get("username", "Admin"),
                )

            logger.info(
                f"Assignment notifications sent for inquiry {inquiry_data.get('id')}"
            )

        except Exception as e:
            logger.error(f"Failed to send assignment notifications: {e}")

    async def notify_urgent_message(
        self,
        message_data: Dict[str, Any],
        inquiry_data: Dict[str, Any],
        product_data: Dict[str, Any],
    ):
        """Send urgent notification for important customer messages"""
        try:
            # Send real-time WebSocket notification
            if self.websocket_manager:
                await self._send_websocket_notification(
                    {
                        "type": "urgent_message",
                        "message_id": message_data.get("id"),
                        "inquiry_id": inquiry_data.get("id"),
                        "session_id": inquiry_data.get("session_id"),
                        "product_name": product_data.get("name"),
                        "customer_name": inquiry_data.get("customer_name", "Anonymous"),
                        "message": message_data.get("message_text", ""),
                        "priority": "urgent",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

            logger.info(
                f"Urgent message notifications sent for message {message_data.get('id')}"
            )

        except Exception as e:
            logger.error(f"Failed to send urgent message notifications: {e}")

    async def _send_websocket_notification(self, notification_data: Dict[str, Any]):
        """Send real-time notification via WebSocket to all admins"""
        if not self.websocket_manager:
            return

        try:
            await self.websocket_manager.broadcast_to_admins(
                {"type": "admin_notification", "notification": notification_data}
            )
            logger.debug(f"WebSocket notification sent: {notification_data['type']}")

        except Exception as e:
            logger.error(f"Failed to send WebSocket notification: {e}")

    def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics"""
        return {
            "email_configured": self.email_service.is_configured,
            "admin_emails_count": len(self.email_service.admin_emails),
            "websocket_enabled": self.websocket_manager is not None,
            "notifications_sent_today": len(
                self.notification_queue
            ),  # This could be enhanced with proper tracking
        }


# Global notification service instance
notification_service = None


def get_notification_service(websocket_manager=None):
    """Get or create the global notification service instance"""
    global notification_service
    if notification_service is None:
        notification_service = AdminNotificationService(websocket_manager)
    return notification_service
