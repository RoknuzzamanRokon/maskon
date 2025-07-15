# Blog & Portfolio Website

A full-stack blog and portfolio website with:

- **Backend**: Python FastAPI
- **Frontend**: Next.js
- **Database**: MySQL

## Features

- Tech blog posts
- Food blog posts
- Activity posts
- Portfolio page
- Admin dashboard for posting

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup

```bash
cd database
# Run the SQL scripts to create tables
```

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/{category}` - Get posts by category
- `GET /api/portfolio` - Get portfolio data

## Categories

- tech
- food
- activity
