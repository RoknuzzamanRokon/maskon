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

        if existing:
            cursor.execute(
                """
                UPDATE subscribers
                SET status = 'active', source = %s, updated_at = NOW(), unsubscribed_at = NULL
                WHERE email = %s
                """,
                (payload.source, email),
            )
        else:
            cursor.execute(
                """
                INSERT INTO subscribers (email, source, status, created_at, updated_at)
                VALUES (%s, %s, 'active', NOW(), NOW())
                """,
                (email, payload.source),
            )

        cursor.execute(
            "SELECT id, email, source, status, created_at, updated_at FROM subscribers WHERE email = %s",
            (email,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create subscriber")

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
    return {
        "message": "Notification queued",
        "recipients": recipients,
    }
