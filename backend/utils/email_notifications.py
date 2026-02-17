import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Iterable, List, Tuple, Optional

from core import get_db_connection, logger


def _get_public_site_url() -> str:
    return os.getenv("PUBLIC_SITE_URL", "http://localhost:3000").rstrip("/")


def _get_smtp_config() -> Tuple[str, int, str, str, str]:
    host = os.getenv("SMTP_SERVER")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL") or username
    if not host or not username or not password or not from_email:
        raise RuntimeError("SMTP configuration is missing")
    return host, port, username, password, from_email


def _build_email(subject: str, to_email: str, from_email: str, html_body: str, text_body: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")
    return msg


def _build_notification_body(
    title: str, message: str, link: Optional[str]
) -> Tuple[str, str]:
    link_html = (
        f'<p style="margin: 24px 0;"><a href="{link}" style="background:#2563eb;color:#fff;'
        'padding:12px 18px;text-decoration:none;border-radius:8px;display:inline-block;">'
        "View Update</a></p>"
        if link
        else ""
    )
    html_body = f"""
    <html>
      <body style="margin:0;padding:0;background:#0f172a;color:#e2e8f0;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#f8fafc;">{title}</h2>
          <p style="line-height:1.6;color:#cbd5f5;">{message}</p>
          {link_html}
          <p style="font-size:12px;color:#94a3b8;margin-top:32px;">
            You are receiving this email because you subscribed to updates.
          </p>
        </div>
      </body>
    </html>
    """
    text_body = f"{title}\n\n{message}\n{link or ''}".strip()
    return html_body, text_body


def get_active_subscriber_emails() -> List[str]:
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT email FROM subscribers WHERE status = 'active'")
        rows = cursor.fetchall() or []
        return [row[0] for row in rows]
    finally:
        cursor.close()
        connection.close()


def get_active_subscriber_count() -> int:
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM subscribers WHERE status = 'active'")
        return int(cursor.fetchone()[0])
    finally:
        cursor.close()
        connection.close()


def send_email_batch(
    recipients: Iterable[str], subject: str, html_body: str, text_body: str
) -> Tuple[int, int]:
    host, port, username, password, from_email = _get_smtp_config()
    sent = 0
    failed = 0

    if port == 465:
        context = ssl.create_default_context()
        server = smtplib.SMTP_SSL(host, port, context=context, timeout=20)
    else:
        server = smtplib.SMTP(host, port, timeout=20)
        server.ehlo()
        server.starttls(context=ssl.create_default_context())

    try:
        server.login(username, password)
        for email in recipients:
            try:
                msg = _build_email(subject, email, from_email, html_body, text_body)
                server.send_message(msg)
                sent += 1
            except Exception as exc:
                failed += 1
                logger.warning("Failed to send subscriber email to %s: %s", email, exc)
    finally:
        try:
            server.quit()
        except Exception:
            pass

    return sent, failed


def send_subscriber_notification(
    subject: str, title: str, message: str, link: Optional[str] = None
) -> dict:
    recipients = get_active_subscriber_emails()
    if not recipients:
        return {"sent": 0, "failed": 0}

    html_body, text_body = _build_notification_body(title, message, link)
    sent, failed = send_email_batch(recipients, subject, html_body, text_body)
    return {"sent": sent, "failed": failed}


def queue_post_notification(background_tasks, post_id: int, title: str, excerpt: str):
    link = f"{_get_public_site_url()}/blog/post/{post_id}"
    subject = f"New Blog Post: {title}"
    message = f"{excerpt}\n\nRead the full post in the link below."
    background_tasks.add_task(
        send_subscriber_notification, subject, "New Blog Post", message, link
    )


def queue_product_notification(
    background_tasks, product_id: int, name: str, description: str
):
    link = f"{_get_public_site_url()}/products/{product_id}"
    subject = f"New Product: {name}"
    message = f"{description}\n\nExplore the new product in the link below."
    background_tasks.add_task(
        send_subscriber_notification, subject, "New Product Launch", message, link
    )
