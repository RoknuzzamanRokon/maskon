from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Blog & Portfolio API", version="1.0.0")

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
    created_at: datetime
    updated_at: datetime

class PortfolioItem(BaseModel):
    id: int
    title: str
    description: str
    technologies: str
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime

@app.get("/")
async def root():
    return {"message": "Blog & Portfolio API"}

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
async def create_post(post: PostCreate):
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