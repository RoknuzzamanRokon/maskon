#!/usr/bin/env python3
"""
Simple Database Migration Script
Creates all tables in the new database
"""

import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}


def create_tables():
    """Create all database tables"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print(f"Connected to database: {DB_CONFIG['database']}")
    print("Creating tables...\n")

    # Set character set
    cursor.execute("SET NAMES utf8mb4")
    cursor.execute("SET CHARACTER SET utf8mb4")

    tables_created = []

    # Users table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_is_admin (is_admin)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("users")
    except Exception as e:
        print(f"Error creating users table: {e}")

    # Posts table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category ENUM('tech', 'food', 'activity') NOT NULL,
                tags VARCHAR(255),
                image_url VARCHAR(500),
                media_urls JSON DEFAULT NULL,
                likes_count INT DEFAULT 0,
                dislikes_count INT DEFAULT 0,
                comments_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_created_at (created_at DESC),
                INDEX idx_tags (tags),
                FULLTEXT idx_title_content (title, content)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("posts")
    except Exception as e:
        print(f"Error creating posts table: {e}")

    # Post media table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS post_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                media_url VARCHAR(500) NOT NULL,
                media_type ENUM('image', 'video') NOT NULL,
                media_order INT DEFAULT 0,
                original_filename VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                INDEX idx_post_media (post_id, media_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("post_media")
    except Exception as e:
        print(f"Error creating post_media table: {e}")

    # Portfolio table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS portfolio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                technologies VARCHAR(500) NOT NULL,
                project_url VARCHAR(500),
                github_url VARCHAR(500),
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("portfolio")
    except Exception as e:
        print(f"Error creating portfolio table: {e}")

    # Post interactions table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS post_interactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                interaction_type ENUM('like', 'dislike') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_post (user_id, post_id),
                INDEX idx_post_id (post_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("post_interactions")
    except Exception as e:
        print(f"Error creating post_interactions table: {e}")

    # Comments table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_post_id (post_id),
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("comments")
    except Exception as e:
        print(f"Error creating comments table: {e}")

    # Anonymous interactions table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS anonymous_interactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_identifier VARCHAR(100) NOT NULL,
                interaction_type ENUM('like', 'dislike') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                UNIQUE KEY unique_anonymous_interaction (post_id, user_identifier),
                INDEX idx_post_id (post_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("anonymous_interactions")
    except Exception as e:
        print(f"Error creating anonymous_interactions table: {e}")

    # Anonymous comments table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS anonymous_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_identifier VARCHAR(100) NOT NULL,
                username VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                INDEX idx_post_id (post_id),
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("anonymous_comments")
    except Exception as e:
        print(f"Error creating anonymous_comments table: {e}")

    # Product categories table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_categories")
    except Exception as e:
        print(f"Error creating product_categories table: {e}")

    # Products table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                discount DECIMAL(5, 2) DEFAULT NULL,
                specifications TEXT DEFAULT NULL,
                image_url TEXT DEFAULT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_by INT DEFAULT NULL,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_category (category),
                INDEX idx_is_active (is_active),
                INDEX idx_created_at (created_at DESC),
                INDEX idx_price (price),
                INDEX idx_stock (stock),
                FULLTEXT idx_name_description (name, description)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("products")
    except Exception as e:
        print(f"Error creating products table: {e}")

    # Product images table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url TEXT NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product_id (product_id),
                INDEX idx_is_primary (is_primary)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_images")
    except Exception as e:
        print(f"Error creating product_images table: {e}")

    # Product inquiries table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                message TEXT,
                inquiry_type VARCHAR(50) DEFAULT 'purchase',
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                responded_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product_id (product_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_inquiries")
    except Exception as e:
        print(f"Error creating product_inquiries table: {e}")

    # Product chat sessions table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_chat_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                session_id VARCHAR(255) NOT NULL UNIQUE,
                customer_email VARCHAR(255) DEFAULT NULL,
                customer_name VARCHAR(255) DEFAULT NULL,
                status ENUM('active', 'pending', 'in_progress', 'resolved', 'closed') DEFAULT 'active',
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                assigned_admin_id INT DEFAULT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_product_session (product_id, session_id),
                INDEX idx_status (status),
                INDEX idx_last_message (last_message_at DESC),
                INDEX idx_assigned_admin (assigned_admin_id),
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_chat_sessions")
    except Exception as e:
        print(f"Error creating product_chat_sessions table: {e}")

    # Product chat messages table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT NOT NULL,
                sender_type ENUM('customer', 'admin', 'system') NOT NULL,
                sender_id INT DEFAULT NULL,
                sender_name VARCHAR(255) DEFAULT NULL,
                message_text TEXT NOT NULL,
                message_type ENUM('text', 'system', 'image', 'file') DEFAULT 'text',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_session_created (session_id, created_at),
                INDEX idx_unread (is_read, created_at),
                INDEX idx_sender (sender_type, sender_id),
                INDEX idx_created_at (created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_chat_messages")
    except Exception as e:
        print(f"Error creating product_chat_messages table: {e}")

    # Product chat metadata table
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_chat_metadata (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT NOT NULL,
                metadata_key VARCHAR(100) NOT NULL,
                metadata_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
                UNIQUE KEY unique_session_key (session_id, metadata_key),
                INDEX idx_session_key (session_id, metadata_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        )
        tables_created.append("product_chat_metadata")
    except Exception as e:
        print(f"Error creating product_chat_metadata table: {e}")

    conn.commit()

    print(f"\n✓ Successfully created {len(tables_created)} tables:")
    for table in tables_created:
        print(f"  • {table}")

    # Insert default admin user
    print("\nInserting default admin user...")
    try:
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash, is_admin, created_at)
            VALUES ('maskon123', 'admin@maskon.com', 
                    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L3jzZvUxO', 
                    TRUE, NOW())
            ON DUPLICATE KEY UPDATE username = username
        """
        )
        conn.commit()
        print("✓ Admin user created (username: maskon123, password: maskon123maskon)")
    except Exception as e:
        print(f"Note: {e}")

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("Migration completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        create_tables()
    except Exception as e:
        print(f"Error: {e}")
