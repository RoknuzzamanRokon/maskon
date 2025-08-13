from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
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

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'blog_portfolio'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
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
    image_url: Optional[str] = None

class Post(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: Optional[str] = None
    image_url: Optional[str] = None
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
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_current_admin(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user or not user['is_admin']:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user_id
    finally:
        cursor.close()
        connection.close()

@app.get("/")
async def root():
    return {"message": "Blog & Portfolio API"}

# Create static directory if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Registration disabled - Admin only system
@app.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    raise HTTPException(status_code=403, detail="Registration is disabled. This is an admin-only system.")

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id, username, password_hash, is_admin FROM users WHERE username = %s", (user.username,))
        db_user = cursor.fetchone()
        
        if not db_user or not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user['id'])}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user['id'],
            "username": db_user['username'],
            "is_admin": db_user['is_admin']
        }
    finally:
        cursor.close()
        connection.close()

@app.get("/api/me")
async def get_current_user_info(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id, username, email, is_admin FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        cursor.close()
        connection.close()

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), admin_id: int = Depends(get_current_admin)):
    UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
    finally:
        file.file.close()

    # Construct the full URL for the uploaded image
    base_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
    image_url = f"{base_url}/static/uploads/{unique_filename}"
    return {"filename": unique_filename, "url": image_url}

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
        return posts
    finally:
        cursor.close()
        connection.close()

@app.post("/api/posts", response_model=dict)
async def create_post(post: PostCreate, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        query = """
        INSERT INTO posts (title, content, category, tags, image_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(query, (post.title, post.content, post.category, post.tags, post.image_url))
        connection.commit()
        
        return {"message": "Post created successfully", "id": cursor.lastrowid}
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

# User interactions (likes/dislikes)
@app.post("/api/posts/{post_id}/interact")
async def interact_with_post(post_id: int, interaction: PostInteraction, user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Check if user already interacted with this post
        cursor.execute("SELECT interaction_type FROM post_interactions WHERE post_id = %s AND user_id = %s", (post_id, user_id))
        existing = cursor.fetchone()
        
        if existing:
            if existing[0] == interaction.interaction_type:
                # Remove interaction if same type
                cursor.execute("DELETE FROM post_interactions WHERE post_id = %s AND user_id = %s", (post_id, user_id))
                message = f"{interaction.interaction_type} removed"
            else:
                # Update interaction type
                cursor.execute("UPDATE post_interactions SET interaction_type = %s WHERE post_id = %s AND user_id = %s", 
                             (interaction.interaction_type, post_id, user_id))
                message = f"Changed to {interaction.interaction_type}"
        else:
            # Add new interaction
            cursor.execute("INSERT INTO post_interactions (post_id, user_id, interaction_type, created_at) VALUES (%s, %s, %s, NOW())", 
                         (post_id, user_id, interaction.interaction_type))
            message = f"{interaction.interaction_type} added"
        
        connection.commit()
        
        # Get updated counts
        cursor.execute("SELECT COUNT(*) FROM post_interactions WHERE post_id = %s AND interaction_type = 'like'", (post_id,))
        likes_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM post_interactions WHERE post_id = %s AND interaction_type = 'dislike'", (post_id,))
        dislikes_count = cursor.fetchone()[0]
        
        return {
            "message": message,
            "likes_count": likes_count,
            "dislikes_count": dislikes_count
        }
    finally:
        cursor.close()
        connection.close()

# Comments
@app.post("/api/posts/{post_id}/comments")
async def add_comment(post_id: int, comment: CommentCreate, user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("INSERT INTO comments (post_id, user_id, content, created_at) VALUES (%s, %s, %s, NOW())", 
                     (post_id, user_id, comment.content))
        connection.commit()
        
        return {"message": "Comment added successfully", "id": cursor.lastrowid}
    finally:
        cursor.close()
        connection.close()

@app.get("/api/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments(post_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = """
        SELECT c.id, c.post_id, c.user_id, u.username, c.content, c.created_at 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = %s 
        ORDER BY c.created_at DESC
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
        
        if comment['user_id'] != user_id and not user['is_admin']:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
        connection.commit()
        
        return {"message": "Comment deleted successfully"}
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
