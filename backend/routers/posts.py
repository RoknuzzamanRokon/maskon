from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel

from core import (
    Post,
    PostCreate,
    PostInteraction,
    get_current_admin,
    get_current_user,
    get_db_connection,
)
from utils.email_notifications import queue_post_notification


router = APIRouter()


@router.get("/api/posts", response_model=List[Post])
async def get_posts(category: Optional[str] = None, limit: int = 10):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if category:
            query = "SELECT * FROM posts WHERE category = %s ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (category, limit))
        else:
            query = "SELECT * FROM posts ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (limit,))

        posts = cursor.fetchall()

        # Parse media_urls JSON field
        import json

        for post in posts:
            if post.get("media_urls"):
                try:
                    post["media_urls"] = json.loads(post["media_urls"])
                except (json.JSONDecodeError, TypeError):
                    post["media_urls"] = None
            else:
                post["media_urls"] = None

        return posts
    finally:
        cursor.close()
        connection.close()


@router.post("/api/posts", response_model=dict)
async def create_post(
    post: PostCreate,
    background_tasks: BackgroundTasks,
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Convert media_urls to JSON string if provided
        media_urls_json = None
        if post.media_urls:
            import json

            media_urls_json = json.dumps(post.media_urls)

        query = """
        INSERT INTO posts (title, content, category, tags, image_url, media_urls, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                post.title,
                post.content,
                post.category,
                post.tags,
                post.image_url,
                media_urls_json,
            ),
        )
        connection.commit()
        post_id = cursor.lastrowid

        excerpt = (post.content or "").strip()
        if len(excerpt) > 180:
            excerpt = f"{excerpt[:177]}..."
        queue_post_notification(background_tasks, post_id, post.title, excerpt)

        return {"message": "Post created successfully", "id": post_id}
    finally:
        cursor.close()
        connection.close()


@router.delete("/api/posts/{post_id}")
async def delete_post(post_id: int, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete related comments and interactions first
        cursor.execute("DELETE FROM comments WHERE post_id = %s", (post_id,))
        cursor.execute("DELETE FROM post_interactions WHERE post_id = %s", (post_id,))

        # Delete the post
        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Post not found")

        connection.commit()
        return {"message": "Post deleted successfully"}
    finally:
        cursor.close()
        connection.close()


# Anonymous user interactions (likes/dislikes)
@router.post("/api/posts/{post_id}/interact")
async def interact_with_post(
    post_id: int, interaction: PostInteraction, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Use IP address as anonymous user identifier
        client_ip = request.client.host
        anonymous_user_id = f"anon_{client_ip}"

        # Check if this IP already interacted with this post
        cursor.execute(
            "SELECT interaction_type FROM anonymous_interactions WHERE post_id = %s AND user_identifier = %s",
            (post_id, anonymous_user_id),
        )
        existing = cursor.fetchone()

        if existing:
            if existing[0] == interaction.interaction_type:
                # Remove interaction if same type (toggle off)
                cursor.execute(
                    "DELETE FROM anonymous_interactions WHERE post_id = %s AND user_identifier = %s",
                    (post_id, anonymous_user_id),
                )
                message = f"{interaction.interaction_type} removed"
            else:
                # Update interaction type
                cursor.execute(
                    "UPDATE anonymous_interactions SET interaction_type = %s WHERE post_id = %s AND user_identifier = %s",
                    (interaction.interaction_type, post_id, anonymous_user_id),
                )
                message = f"Changed to {interaction.interaction_type}"
        else:
            # Add new interaction
            cursor.execute(
                "INSERT INTO anonymous_interactions (post_id, user_identifier, interaction_type, created_at) VALUES (%s, %s, %s, NOW())",
                (post_id, anonymous_user_id, interaction.interaction_type),
            )
            message = f"{interaction.interaction_type} added"

        connection.commit()

        # Get updated counts
        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_interactions WHERE post_id = %s AND interaction_type = 'like'",
            (post_id,),
        )
        likes_count = cursor.fetchone()[0]

        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_interactions WHERE post_id = %s AND interaction_type = 'dislike'",
            (post_id,),
        )
        dislikes_count = cursor.fetchone()[0]

        # Update post counts
        cursor.execute(
            "UPDATE posts SET likes_count = %s, dislikes_count = %s WHERE id = %s",
            (likes_count, dislikes_count, post_id),
        )
        connection.commit()

        return {
            "message": message,
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
        }
    finally:
        cursor.close()
        connection.close()


# Anonymous comments
class AnonymousCommentCreate(BaseModel):
    content: str
    username: str  # Display name for anonymous user


@router.post("/api/posts/{post_id}/comments")
async def add_anonymous_comment(
    post_id: int, comment: AnonymousCommentCreate, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Use IP address as anonymous user identifier
        client_ip = request.client.host
        anonymous_user_id = f"anon_{client_ip}"

        cursor.execute(
            "INSERT INTO anonymous_comments (post_id, user_identifier, username, content, created_at) VALUES (%s, %s, %s, %s, NOW())",
            (post_id, anonymous_user_id, comment.username, comment.content),
        )
        connection.commit()

        # Update comment count in posts table
        cursor.execute(
            "SELECT COUNT(*) FROM anonymous_comments WHERE post_id = %s", (post_id,)
        )
        comment_count = cursor.fetchone()[0]
        cursor.execute(
            "UPDATE posts SET comments_count = %s WHERE id = %s",
            (comment_count, post_id),
        )
        connection.commit()

    finally:
        cursor.close()
        connection.close()


@router.get("/api/posts/{post_id}/comments")
async def get_comments(post_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get anonymous comments
        query = """
        SELECT id, post_id, username, content, created_at, 'anonymous' as user_type
        FROM anonymous_comments 
        WHERE post_id = %s 
        ORDER BY created_at DESC
        """
        cursor.execute(query, (post_id,))
        comments = cursor.fetchall()
        return comments
    finally:
        cursor.close()
        connection.close()


@router.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: int, user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if user owns the comment or is admin
        cursor.execute("SELECT user_id FROM comments WHERE id = %s", (comment_id,))
        comment = cursor.fetchone()

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if comment["user_id"] != user_id and not user["is_admin"]:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this comment"
            )

        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
        connection.commit()

    finally:
        cursor.close()
        connection.close()


@router.get("/api/posts/{post_id}", response_model=Post)
async def get_post(post_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM posts WHERE id = %s"
        cursor.execute(query, (post_id,))
        post = cursor.fetchone()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Parse media_urls JSON field
        import json

        if post.get("media_urls"):
            try:
                post["media_urls"] = json.loads(post["media_urls"])
            except (json.JSONDecodeError, TypeError):
                post["media_urls"] = None
        else:
            post["media_urls"] = None

        return post
    finally:
        cursor.close()
        connection.close()
