# Blog & Portfolio Website

A full-stack blog and portfolio website with:

- **Backend**: Python FastAPI
- **Frontend**: Next.js
- **Database**: MySQL
- **Communication**: WhatsApp integration for customer support

## Features

- Tech blog posts
- Food blog posts
- Activity posts
- Portfolio page
- Admin dashboard for posting
- Product catalog with WhatsApp chat integration
- Contact forms and WhatsApp support

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

## WhatsApp Integration

The website includes WhatsApp chat integration for customer support:

- **Phone Number**: +880 173 99 33258
- **Features**: 
  - Floating WhatsApp button on product pages
  - Pre-filled messages with product context
  - Direct links from product listings
  - Contact page integration

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/{category}` - Get posts by category
- `GET /api/portfolio` - Get portfolio data
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get specific product

## Categories

- tech
- food
- activity
