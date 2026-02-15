from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from core import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    chat_rate_limiter,
    connection_pool,
    db_optimizer,
    get_current_admin,
    get_db_connection,
    logger,
    websocket_manager,
)


router = APIRouter()


@router.get("/api/admin/security-stats")
async def get_security_stats(admin_id: int = Depends(get_current_admin)):
    """Get security and performance statistics (admin only)"""
    try:
        stats = {
            "rate_limiter": chat_rate_limiter.get_stats(),
            "connection_pool": connection_pool.get_metrics().to_dict(),
            "websocket_manager": websocket_manager.get_connection_stats(),
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Add database performance stats if available
        try:
            stats["database_performance"] = db_optimizer.analyze_query_performance()
        except:
            stats["database_performance"] = {
                "error": "Database performance analysis not available"
            }

        return stats
    except Exception as e:
        logger.error(f"Error getting security stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve security statistics"
        )


@router.post("/api/admin/optimize-database")
async def optimize_database(admin_id: int = Depends(get_current_admin)):
    """Optimize database indexes and performance (admin only)"""
    try:
        optimizations = db_optimizer.optimize_chat_indexes()
        return {
            "message": "Database optimization completed",
            "optimizations": optimizations,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error optimizing database: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize database")


@router.post("/api/admin/cleanup-old-data")
async def cleanup_old_data(
    days_to_keep: int = 90, admin_id: int = Depends(get_current_admin)
):
    """Clean up old chat data (admin only)"""
    try:
        deleted_count = db_optimizer.cleanup_old_data(days_to_keep)
        return {
            "message": f"Cleaned up {deleted_count} old records",
            "deleted_count": deleted_count,
            "days_kept": days_to_keep,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error cleaning up old data: {e}")
        raise HTTPException(status_code=500, detail="Failed to clean up old data")


@router.get("/api/admin/product-inquiries")
async def get_product_inquiries(admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """
        SELECT pi.*, p.name as product_name, p.price as product_price
        FROM product_inquiries pi
        JOIN products p ON pi.product_id = p.id
        ORDER BY pi.created_at DESC
        """
        cursor.execute(query)
        inquiries = cursor.fetchall()
        return inquiries
    finally:
        cursor.close()
        connection.close()


@router.put("/api/admin/product-inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: int, status: str, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        valid_statuses = ["pending", "responded", "closed"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {valid_statuses}",
            )

        query = "UPDATE product_inquiries SET status = %s, responded_at = NOW() WHERE id = %s"
        cursor.execute(query, (status, inquiry_id))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")

        connection.commit()
        return {"message": "Inquiry status updated successfully"}
    finally:
        cursor.close()
        connection.close()


# Admin Notifications endpoint
@router.get("/api/admin/notifications")
async def get_admin_notifications(admin_id: int = Depends(get_current_admin)):
    """Get admin notifications including unread messages, system alerts, and activity summaries"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        notifications = []

        # Get unread chat messages count
        cursor.execute(
            """
            SELECT COUNT(*) as unread_count 
            FROM product_chat_messages cm
            JOIN product_chat_sessions cs ON cm.session_id = cs.id
            WHERE cm.sender_type = 'customer' AND cm.is_read = FALSE
        """
        )
        unread_messages = cursor.fetchone()

        if unread_messages and unread_messages["unread_count"] > 0:
            notifications.append(
                {
                    "id": "unread_messages",
                    "type": "chat",
                    "title": "Unread Messages",
                    "message": f"You have {unread_messages['unread_count']} unread customer messages",
                    "count": unread_messages["unread_count"],
                    "priority": (
                        "high" if unread_messages["unread_count"] > 10 else "medium"
                    ),
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/chat",
                }
            )

        # Get pending product inquiries
        cursor.execute(
            """
            SELECT COUNT(*) as pending_count 
            FROM product_inquiries 
            WHERE status = 'pending'
        """
        )
        pending_inquiries = cursor.fetchone()

        if pending_inquiries and pending_inquiries["pending_count"] > 0:
            notifications.append(
                {
                    "id": "pending_inquiries",
                    "type": "inquiry",
                    "title": "Pending Inquiries",
                    "message": f"{pending_inquiries['pending_count']} product inquiries need attention",
                    "count": pending_inquiries["pending_count"],
                    "priority": "medium",
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/inquiries",
                }
            )

        # Get recent system activity (last 24 hours)
        cursor.execute(
            """
            SELECT COUNT(*) as new_sessions 
            FROM product_chat_sessions 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        """
        )
        new_sessions = cursor.fetchone()

        if new_sessions and new_sessions["new_sessions"] > 0:
            notifications.append(
                {
                    "id": "new_sessions",
                    "type": "activity",
                    "title": "New Chat Sessions",
                    "message": f"{new_sessions['new_sessions']} new chat sessions started today",
                    "count": new_sessions["new_sessions"],
                    "priority": "low",
                    "created_at": datetime.utcnow(),
                    "action_url": "/admin/chat",
                }
            )

        return {
            "notifications": notifications,
            "total_count": len(notifications),
            "unread_count": sum(
                1 for n in notifications if n["priority"] in ["high", "medium"]
            ),
            "last_updated": datetime.utcnow(),
        }

    except Exception as e:
        logger.error(f"Error fetching admin notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")
    finally:
        cursor.close()
        connection.close()


# Admin Settings endpoint
@router.get("/api/admin/settings")
async def get_admin_settings(admin_id: int = Depends(get_current_admin)):
    """Get admin settings and system configuration"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get admin user info
        cursor.execute(
            """
            SELECT id, username, email, is_admin, created_at
            FROM users 
            WHERE id = %s
        """,
            (admin_id,),
        )
        admin_info = cursor.fetchone()

        # Get system statistics
        cursor.execute("SELECT COUNT(*) as total_posts FROM posts")
        posts_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_products FROM products")
        products_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_sessions FROM product_chat_sessions")
        sessions_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_messages FROM product_chat_messages")
        messages_count = cursor.fetchone()

        # Get recent activity stats
        cursor.execute(
            """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM product_chat_sessions 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """
        )
        recent_activity = cursor.fetchall()

        settings = {
            "admin_info": admin_info,
            "system_stats": {
                "total_posts": posts_count["total_posts"] if posts_count else 0,
                "total_products": (
                    products_count["total_products"] if products_count else 0
                ),
                "total_chat_sessions": (
                    sessions_count["total_sessions"] if sessions_count else 0
                ),
                "total_messages": (
                    messages_count["total_messages"] if messages_count else 0
                ),
            },
            "recent_activity": recent_activity,
            "system_config": {
                "chat_enabled": True,
                "file_uploads_enabled": True,
                "max_file_size_mb": 50,
                "supported_file_types": [
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                    "video/mp4",
                    "video/webm",
                ],
                "rate_limiting_enabled": True,
                "websocket_enabled": True,
            },
            "security_settings": {
                "session_timeout_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
                "max_login_attempts": 5,
                "password_min_length": 8,
                "require_admin_approval": True,
            },
            "last_updated": datetime.utcnow(),
        }

        return settings

    except Exception as e:
        logger.error(f"Error fetching admin settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin settings")
    finally:
        cursor.close()
        connection.close()


@router.put("/api/admin/settings")
async def update_admin_settings(
    settings_update: dict, admin_id: int = Depends(get_current_admin)
):
    """Update admin settings (limited to safe configuration options)"""
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Only allow updating specific safe settings
        allowed_updates = ["email", "notification_preferences"]

        if "email" in settings_update and "email" in allowed_updates:
            # Update admin email
            new_email = settings_update["email"]
            if not new_email or "@" not in new_email:
                raise HTTPException(status_code=400, detail="Invalid email format")

            cursor.execute(
                """
                UPDATE users 
                SET email = %s 
                WHERE id = %s
            """,
                (new_email, admin_id),
            )

        connection.commit()

        return {
            "message": "Settings updated successfully",
            "updated_at": datetime.utcnow(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating admin settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")
    finally:
        cursor.close()
        connection.close()
