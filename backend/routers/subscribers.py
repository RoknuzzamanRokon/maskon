from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from mysql.connector import Error

from core import (
    get_db_connection,
    validate_email,
    SubscriberCreate,
    Subscriber,
    SubscriberNotification,
    SubscriberResponse,
    get_current_admin,
)
from utils.email_notifications import (
    get_active_subscriber_count,
    send_subscriber_notification,
)
from utils.notifications import create_admin_notification


router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])


@router.post("", response_model=SubscriberResponse)
def create_subscriber(payload: SubscriberCreate):
    try:
        email = validate_email(payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, email, source, status, created_at, updated_at FROM subscribers WHERE email = %s",
            (email,),
        )
        existing = cursor.fetchone()

        if existing and existing["status"] == "active":
            return SubscriberResponse(**existing, already_subscribed=True)

        created_new = False
        reactivated = False

        if existing:
            cursor.execute(
                """
                UPDATE subscribers
                SET status = 'active', source = %s, updated_at = NOW(), unsubscribed_at = NULL
                WHERE email = %s
                """,
                (payload.source, email),
            )
            reactivated = True
        else:
            cursor.execute(
                """
                INSERT INTO subscribers (email, source, status, created_at, updated_at)
                VALUES (%s, %s, 'active', NOW(), NOW())
                """,
                (email, payload.source),
            )
            created_new = True

        cursor.execute(
            "SELECT id, email, source, status, created_at, updated_at FROM subscribers WHERE email = %s",
            (email,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create subscriber")

        if created_new or reactivated:
            action_label = "View Subscribers"
            create_admin_notification(
                notification_type="success",
                title="New Subscriber",
                message=f"{email} subscribed to your updates.",
                category="user",
                priority="low",
                action_url="/admin/subscribers",
                action_label=action_label,
                source="Subscribers",
                metadata={"subscriber_id": row["id"], "source": row["source"]},
            )

        return SubscriberResponse(**row, already_subscribed=False)
    except Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Subscriber storage error. Ensure the subscribers table exists.",
        ) from exc
    finally:
        cursor.close()
        connection.close()


@router.get("", response_model=list[Subscriber])
def list_subscribers(limit: int = 50, offset: int = 0, _: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT id, email, source, status, created_at, updated_at
            FROM subscribers
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        )
        rows = cursor.fetchall() or []
        return [Subscriber(**row) for row in rows]
    except Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Subscriber storage error. Ensure the subscribers table exists.",
        ) from exc
    finally:
        cursor.close()
        connection.close()


@router.post("/notify", response_model=dict)
def notify_subscribers(
    payload: SubscriberNotification,
    background_tasks: BackgroundTasks,
    _: int = Depends(get_current_admin),
):
    recipients = get_active_subscriber_count()
    background_tasks.add_task(
        send_subscriber_notification,
        payload.subject,
        payload.title,
        payload.message,
        payload.link,
    )
    create_admin_notification(
        notification_type="success",
        title="Subscriber Update Sent",
        message=f"Subscriber update queued for {recipients} recipients.",
        category="content",
        priority="low",
        action_url="/admin/notifications",
        action_label="View Notifications",
        source="Subscribers",
        metadata={"recipients": recipients, "subject": payload.subject},
    )
    return {
        "message": "Notification queued",
        "recipients": recipients,
    }
