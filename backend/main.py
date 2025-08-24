from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import uuid
import shutil
import jwt
from passlib.context import CryptContext
import hashlib

load_dotenv()

app = FastAPI(title="Blog & Portfolio API", version="1.0.0")


# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # print(f"Request: {request.method} {request.url}")
    # print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    # print(f"Response status: {response.status_code}")
    return response


# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
        )
        return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")


# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    is_admin: bool


class PostCreate(BaseModel):
    title: str
    content: str
    category: str  # tech, food, activity
    tags: Optional[str] = None
    image_url: Optional[str] = None  # Keep for backward compatibility
    media_urls: Optional[List[dict]] = None  # New field for multiple media


class Post(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: Optional[str] = None
    image_url: Optional[str] = None
    media_urls: Optional[List[dict]] = None
    likes_count: Optional[int] = 0
    dislikes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime


class CommentCreate(BaseModel):
    content: str


class Comment(BaseModel):
    id: int
    post_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime


class PostInteraction(BaseModel):
    post_id: int
    interaction_type: str  # 'like' or 'dislike'


class PortfolioItem(BaseModel):
    id: int
    title: str
    description: str
    technologies: str
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime


class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    stock: int
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_urls: List[str] = []  # Changed from image_url to image_urls
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class Product(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float
    stock: int
    discount: Optional[float] = None
    specifications: Optional[str] = None
    image_urls: List[str] = []  # Changed from image_url to image_urls
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None


class ProductInquiry(BaseModel):
    product_id: int
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    message: Optional[str] = None
    inquiry_type: str = "purchase"


# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )


def get_current_admin(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user or not user["is_admin"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user_id
    finally:
        cursor.close()
        connection.close()


@app.get("/")
async def root():
    return {"message": "Blog & Portfolio API"}


@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


# Create static directory if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Registration disabled - Admin only system
@app.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    raise HTTPException(
        status_code=403,
        detail="Registration is disabled. This is an admin-only system.",
    )


@app.options("/api/login")
async def login_options():
    return {"message": "OK"}


@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    print(f"Login attempt for username: {user.username}")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, password_hash, is_admin FROM users WHERE username = %s",
            (user.username,),
        )
        db_user = cursor.fetchone()
        print(f"User found in database: {db_user is not None}")

        if not db_user:
            print("User not found in database")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        password_valid = verify_password(user.password, db_user["password_hash"])
        print(f"Password valid: {password_valid}")

        if not password_valid:
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user["id"])}, expires_delta=access_token_expires
        )

        print("Login successful, returning token")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user["id"],
            "username": db_user["username"],
            "is_admin": db_user["is_admin"],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        cursor.close()
        connection.close()


@app.get("/api/me")
async def get_current_user_info(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, email, is_admin FROM users WHERE id = %s", (user_id,)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        cursor.close()
        connection.close()


@app.post("/api/upload-media")
async def upload_media(
    files: List[UploadFile] = File(...), admin_id: int = Depends(get_current_admin)
):
    UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    uploaded_files = []
    allowed_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    allowed_video_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
    ]

    for file in files:
        # Check file type
        if file.content_type not in allowed_image_types + allowed_video_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Only images and videos are supported.",
            )

        # Check file size (50MB limit for videos, 10MB for images)
        file_size_limit = (
            50 * 1024 * 1024
            if file.content_type in allowed_video_types
            else 10 * 1024 * 1024
        )

        file_extension = file.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Get file size after upload
            file_size = os.path.getsize(file_path)
            if file_size > file_size_limit:
                os.remove(file_path)  # Remove the file
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {file_size_limit // (1024*1024)}MB",
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
        finally:
            file.file.close()

        # Construct the full URL for the uploaded file
        base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        file_url = f"{base_url}/static/uploads/{unique_filename}"

        # Determine media type
        media_type = "image" if file.content_type in allowed_image_types else "video"

        uploaded_files.append(
            {
                "filename": unique_filename,
                "url": file_url,
                "type": media_type,
                "original_name": file.filename,
            }
        )

    return {"uploaded_files": uploaded_files}


# Keep the old single image upload for backward compatibility
@app.post("/api/upload-image")
async def upload_single_image(
    file: UploadFile = File(...), admin_id: int = Depends(get_current_admin)
):
    result = await upload_media([file], admin_id)
    if result["uploaded_files"]:
        return result["uploaded_files"][0]
    else:
        raise HTTPException(status_code=500, detail="Upload failed")


@app.get("/api/posts", response_model=List[Post])
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


@app.post("/api/posts", response_model=dict)
async def create_post(post: PostCreate, admin_id: int = Depends(get_current_admin)):
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

        return {"message": "Post created successfully", "id": post_id}
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/posts/{post_id}")
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
@app.post("/api/posts/{post_id}/interact")
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


@app.post("/api/posts/{post_id}/comments")
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


@app.get("/api/posts/{post_id}/comments")
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


@app.delete("/api/comments/{comment_id}")
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


@app.get("/api/posts/{post_id}", response_model=Post)
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


@app.get("/api/portfolio", response_model=List[PortfolioItem])
async def get_portfolio():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM portfolio ORDER BY created_at DESC"
        cursor.execute(query)
        portfolio_items = cursor.fetchall()
        return portfolio_items
    finally:
        cursor.close()
        connection.close()


# Product API endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, limit: int = 20):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if category and category != "all":
            query = "SELECT * FROM products WHERE category = %s AND is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (category, limit))
        else:
            query = "SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (limit,))

        products = cursor.fetchall()
        return products
    finally:
        cursor.close()
        connection.close()


@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM products WHERE id = %s"
        cursor.execute(query, (product_id,))
        product_data = cursor.fetchone()

        if not product_data:
            raise HTTPException(status_code=404, detail="Product not found")

        # Fetch additional images for this product, ordered by primary first
        cursor.execute(
            "SELECT id, image_url, is_primary FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        image_urls = [img["image_url"] for img in images] if images else []

        # Construct the Product model instance
        product = Product(
            id=product_data["id"],
            name=product_data["name"],
            description=product_data["description"],
            category=product_data["category"],
            price=product_data["price"],
            stock=product_data["stock"],
            discount=product_data["discount"],
            specifications=product_data["specifications"],
            image_urls=image_urls,  # Use the fetched image_urls
            is_active=product_data["is_active"],
            created_at=product_data["created_at"],
            updated_at=product_data["updated_at"],
            created_by=product_data["created_by"],
        )

        # Add images array to the response for frontend gallery
        product_dict = product.dict()
        product_dict["images"] = images  # Include detailed image info

        return product_dict
    finally:
        cursor.close()
        connection.close()


@app.post("/api/products", response_model=dict)
async def create_product(
    product: ProductCreate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Validation: Check if at least one image is provided
        if not product.image_urls or len(product.image_urls) == 0:
            raise HTTPException(
                status_code=400, detail="At least one product image is required"
            )

        # Validate image URLs
        for i, url in enumerate(product.image_urls):
            if not url or not url.strip():
                raise HTTPException(
                    status_code=400,
                    detail=f"Image URL at position {i + 1} is empty or invalid",
                )

        # Start transaction
        connection.start_transaction()

        query = """
        INSERT INTO products (name, description, category, price, stock, discount, specifications, is_active, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                product.name,
                product.description,
                product.category,
                product.price,
                product.stock,
                product.discount,
                product.specifications,
                product.is_active,
                admin_id,
            ),
        )
        product_id = cursor.lastrowid

        # Insert images into product_images table
        image_records = []
        for i, url in enumerate(product.image_urls):
            # First image is primary, others are not
            is_primary = i == 0
            image_records.append((product_id, url, is_primary))

        cursor.executemany(
            """
            INSERT INTO product_images (product_id, image_url, is_primary, created_at)
            VALUES (%s, %s, %s, NOW())
            """,
            image_records,
        )

        # Commit transaction
        connection.commit()

        return {
            "message": "Product created successfully",
            "id": product_id,
            "images_saved": len(product.image_urls),
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        connection.rollback()
        raise
    except Exception as e:
        # Handle database errors
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create product: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@app.put("/api/products/{product_id}", response_model=dict)
async def update_product(
    product_id: int, product: ProductUpdate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Build dynamic update query
        update_fields = []
        update_values = []

        if product.name is not None:
            update_fields.append("name = %s")
            update_values.append(product.name)
        if product.description is not None:
            update_fields.append("description = %s")
            update_values.append(product.description)
        if product.category is not None:
            update_fields.append("category = %s")
            update_values.append(product.category)
        if product.price is not None:
            update_fields.append("price = %s")
            update_values.append(product.price)
        if product.stock is not None:
            update_fields.append("stock = %s")
            update_values.append(product.stock)
        if product.discount is not None:
            update_fields.append("discount = %s")
            update_values.append(product.discount)
        if product.specifications is not None:
            update_fields.append("specifications = %s")
            update_values.append(product.specifications)
        if product.image_url is not None:
            update_fields.append("image_url = %s")
            update_values.append(product.image_url)
        if product.is_active is not None:
            update_fields.append("is_active = %s")
            update_values.append(product.is_active)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = NOW()")
        update_values.append(product_id)

        query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.commit()
        return {"message": "Product updated successfully"}
    finally:
        cursor.close()
        connection.close()


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete related inquiries first
        cursor.execute(
            "DELETE FROM product_inquiries WHERE product_id = %s", (product_id,)
        )

        # Delete the product
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.commit()
        return {"message": "Product deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@app.post("/api/products/{product_id}/inquire")
async def create_product_inquiry(
    product_id: int, inquiry: ProductInquiry, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        query = """
        INSERT INTO product_inquiries (product_id, customer_name, customer_email, customer_phone, message, inquiry_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(
            query,
            (
                product_id,
                inquiry.customer_name,
                inquiry.customer_email,
                inquiry.customer_phone,
                inquiry.message,
                inquiry.inquiry_type,
            ),
        )
        connection.commit()

        return {"message": "Inquiry submitted successfully", "id": cursor.lastrowid}
    finally:
        cursor.close()
        connection.close()


@app.get("/api/admin/product-inquiries")
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


@app.put("/api/admin/product-inquiries/{inquiry_id}/status")
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


# Product Images API endpoints
@app.post("/api/products/{product_id}/images")
async def add_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Upload images
        uploaded_files = await upload_media(files, admin_id)

        # Prepare bulk insert
        image_records = [
            (product_id, f["url"], False)
            for f in uploaded_files["uploaded_files"]
            if f["type"] == "image"
        ]

        if image_records:
            cursor.executemany(
                """
                INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                VALUES (%s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE updated_at = NOW()
                """,
                image_records,
            )
            connection.commit()

            cursor.execute(
                """
                SELECT id, image_url, is_primary, created_at
                FROM product_images
                WHERE product_id = %s
                ORDER BY is_primary DESC, id DESC
                LIMIT %s
                """,
                (product_id, len(image_records)),
            )
            added_images = cursor.fetchall()
        else:
            added_images = []

        return {
            "message": f"Added {len(added_images)} images successfully",
            "images": added_images,
        }

    finally:
        cursor.close()
        connection.close()


@app.delete("/api/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT image_url FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        image = cursor.fetchone()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete from database
        cursor.execute("DELETE FROM product_images WHERE id = %s", (image_id,))
        connection.commit()

        return {"message": "Image deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@app.put("/api/products/{product_id}/images/{image_id}/primary")
async def set_primary_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT id FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Image not found")

        # Remove primary status from all images of this product
        cursor.execute(
            "UPDATE product_images SET is_primary = FALSE WHERE product_id = %s",
            (product_id,),
        )

        # Set this image as primary
        cursor.execute(
            "UPDATE product_images SET is_primary = TRUE WHERE id = %s", (image_id,)
        )

        connection.commit()
        return {"message": "Primary image updated successfully"}
    finally:
        cursor.close()
        connection.close()


@app.get("/api/products/{product_id}/images")
async def get_product_images(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, image_url, is_primary, created_at FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        return images
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
