from datetime import datetime

from fastapi import APIRouter

from core import chat_rate_limiter, connection_pool, get_db_connection, websocket_manager


router = APIRouter()


@router.get("/")
@router.head("/")
async def root():
    return {"message": "Blog & Portfolio API"}


@router.get("/api/health")
async def health_check():
    try:
        # Test database connection
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()

        # Get additional health metrics
        health_data = {"status": "healthy", "database": "connected"}

        # Add rate limiter stats if available
        try:
            health_data["rate_limiter"] = chat_rate_limiter.get_stats()
        except:
            pass

        # Add connection pool stats if available
        try:
            pool_metrics = connection_pool.get_metrics()
            health_data["connection_pool"] = pool_metrics.to_dict()
        except:
            pass

        # Add WebSocket stats
        try:
            health_data["websocket"] = websocket_manager.get_connection_stats()
        except:
            pass

        return health_data
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@router.get("/api/debug/websocket-status")
async def debug_websocket_status():
    """Debug endpoint to check WebSocket connection status"""
    try:
        debug_info = {
            "timestamp": datetime.utcnow().isoformat(),
            "rate_limiter": {
                "stats": chat_rate_limiter.get_stats(),
                "connection_limit": "50 connections per 5 minutes",
                "message_limit": "30 messages per minute",
            },
            "connection_pool": {
                "metrics": connection_pool.get_metrics().to_dict(),
                "max_connections": connection_pool.max_connections,
                "max_per_ip": connection_pool.max_connections_per_ip,
            },
            "websocket_manager": {
                "stats": websocket_manager.get_connection_stats(),
                "active_connections": len(websocket_manager.connections),
            },
        }
        return debug_info
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}


@router.post("/api/debug/reset-rate-limits")
async def reset_rate_limits():
    """Debug endpoint to reset rate limits (for testing)"""
    try:
        # Reset rate limiter stats
        chat_rate_limiter.message_limiter.requests.clear()
        chat_rate_limiter.connection_limiter.requests.clear()
        chat_rate_limiter.session_limiter.requests.clear()
        chat_rate_limiter.blocked_until.clear()
        chat_rate_limiter.suspicious_activity.clear()
        chat_rate_limiter.token_buckets.clear()

        return {
            "message": "Rate limits reset successfully",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}


@router.post("/api/debug/cleanup-websockets")
async def cleanup_websockets():
    """Debug endpoint to manually trigger WebSocket cleanup"""
    try:
        # Clean up stale connections
        stale_count = await websocket_manager.cleanup_stale_connections()

        # Clean up inactive connections
        await websocket_manager.cleanup_inactive_connections()

        # Get current stats
        stats = websocket_manager.get_connection_stats()

        return {
            "message": "WebSocket cleanup completed",
            "stale_connections_cleaned": stale_count,
            "current_stats": stats,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
