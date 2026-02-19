import json
import uuid
from typing import Any, Dict, Optional

from core import get_db_connection, logger


def create_admin_notification(
    *,
    notification_type: str,
    title: str,
    message: str,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    action_url: Optional[str] = None,
    action_label: Optional[str] = None,
    source: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> int:
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id FROM users WHERE is_admin = TRUE")
        admin_rows = cursor.fetchall() or []
        admin_ids = [row["id"] for row in admin_rows]

        if not admin_ids:
            return 0

        metadata_json = json.dumps(metadata) if metadata is not None else None
        records = []

        for admin_id in admin_ids:
            notification_id = f"notif_{uuid.uuid4().hex}"
            records.append(
                (
                    notification_id,
                    admin_id,
                    notification_type,
                    title,
                    message,
                    category,
                    priority,
                    action_url,
                    action_label,
                    source,
                    metadata_json,
                )
            )

        cursor.executemany(
            """
            INSERT INTO admin_notifications (
                id, admin_id, type, title, message, category, priority,
                action_url, action_label, source, metadata, is_read, created_at, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, NOW(), NOW())
            """,
            records,
        )
        connection.commit()
        return len(records)
    except Exception as exc:
        logger.error(f"Failed to create admin notification: {exc}")
        try:
            connection.rollback()
        except Exception:
            pass
        return 0
    finally:
        cursor.close()
        connection.close()
