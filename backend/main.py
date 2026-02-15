from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from core import STATIC_DIR, chat_rate_limiter, connection_pool, logger
from routers import admin, auth, health, portfolio, posts, products, uploads


app = FastAPI(title="Blog & Portfolio API", version="1.0.0")


# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # print(f"Request: {request.method} {request.url}")
    # print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    # print(f"Response status: {response.status_code}")
    return response


# Add rate limiting middleware for chat endpoints
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Rate limiting middleware for chat-related endpoints"""
    client_ip = request.client.host
    path = request.url.path

    # Apply rate limiting to chat endpoints
    if "/api/chat" in path or "/api/products/" in path and "/messages" in path:
        try:
            # Check connection rate limit for new connections
            if request.method == "POST" and "messages" in path:
                allowed, retry_after, reason = (
                    chat_rate_limiter.check_message_rate_limit(
                        client_ip,
                        session_id=request.headers.get("X-Session-ID"),
                        message_length=(
                            len(await request.body()) if hasattr(request, "body") else 0
                        ),
                    )
                )

                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "reason": reason,
                            "retry_after": retry_after,
                        },
                        headers=(
                            {"Retry-After": str(retry_after)} if retry_after else {}
                        ),
                    )

            # Check session creation rate limit
            elif request.method == "POST" and "chat" in path and "session" in path:
                allowed, retry_after, reason = (
                    chat_rate_limiter.check_session_creation_rate_limit(client_ip)
                )

                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "reason": reason,
                            "retry_after": retry_after,
                        },
                        headers=(
                            {"Retry-After": str(retry_after)} if retry_after else {}
                        ),
                    )

        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Continue processing if rate limiting fails

    response = await call_next(request)
    return response


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Create static directory if it doesn't exist
backend_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(backend_dir, STATIC_DIR)
uploads_path = os.path.join(static_path, "uploads")

os.makedirs(static_path, exist_ok=True)
os.makedirs(uploads_path, exist_ok=True)

logger.info(f"Static directory: {static_path}")
logger.info(f"Uploads directory: {uploads_path}")

# Mount static files
app.mount("/static", StaticFiles(directory=static_path), name="static")


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(posts.router)
app.include_router(portfolio.router)
app.include_router(products.router)
app.include_router(admin.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
