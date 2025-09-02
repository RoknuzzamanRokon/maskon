#!/usr/bin/env python3
"""
Fix posts table data - handle JSON media_urls field properly
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()


def get_azure_connection():
    """Get connection to Azure MySQL database"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            ssl_disabled=False,
            port=3306,
            autocommit=True,
        )
        return connection
    except Error as e:
        print(f"❌ Azure MySQL connection failed: {e}")
        return None


def fix_posts_data():
    """Fix posts table data"""
    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        print("🔧 Fixing posts table data...")

        # Clear existing posts and insert sample data with proper JSON
        cursor.execute("DELETE FROM posts")

        # Insert sample posts with proper JSON format
        sample_posts = [
            {
                "title": "Getting Started with FastAPI",
                "content": "FastAPI is a modern, fast web framework for building APIs with Python. It provides automatic API documentation, type hints, and excellent performance.",
                "category": "tech",
                "tags": "python,fastapi,api",
                "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500",
                "media_urls": None,
            },
            {
                "title": "My Favorite Pasta Recipe",
                "content": "Today I want to share my favorite pasta recipe that I learned from my grandmother. This authentic Italian dish has been passed down through generations.",
                "category": "food",
                "tags": "pasta,italian,cooking",
                "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
                "media_urls": None,
            },
            {
                "title": "Morning Workout Routine",
                "content": "Started my day with a 30-minute workout session. Here is what I did to stay fit and energized throughout the day.",
                "category": "activity",
                "tags": "fitness,morning,workout",
                "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
                "media_urls": None,
            },
            {
                "title": "Building a React Dashboard",
                "content": "Learn how to build a modern, responsive dashboard using React, TypeScript, and modern UI libraries. This comprehensive guide covers everything from setup to deployment.",
                "category": "tech",
                "tags": "react,typescript,dashboard,frontend",
                "image_url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
                "media_urls": json.dumps(
                    [
                        {
                            "url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
                            "type": "image",
                        },
                        {
                            "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
                            "type": "image",
                        },
                    ]
                ),
            },
        ]

        insert_query = """
        INSERT INTO posts (title, content, category, tags, image_url, media_urls, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """

        for post in sample_posts:
            cursor.execute(
                insert_query,
                (
                    post["title"],
                    post["content"],
                    post["category"],
                    post["tags"],
                    post["image_url"],
                    post["media_urls"],
                ),
            )

        print(f"✅ Fixed posts table - inserted {len(sample_posts)} sample posts")

        # Verify the data
        cursor.execute("SELECT id, title, category FROM posts")
        posts = cursor.fetchall()
        print("📋 Posts in database:")
        for post in posts:
            print(f"   - {post[0]}: {post[1]} ({post[2]})")

        return True

    except Error as e:
        print(f"❌ Failed to fix posts data: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def fix_products_data():
    """Fix products table data"""
    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        print("🔧 Adding sample products...")

        # Insert sample products
        sample_products = [
            {
                "name": "Premium Wireless Headphones",
                "description": "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
                "category": "electronics",
                "price": 299.99,
                "stock": 25,
                "discount": 15.0,
                "specifications": "Bluetooth 5.0\nBattery Life: 30 hours\nNoise Cancellation: Active\nWeight: 250g\nFrequency Response: 20Hz - 20kHz\nCharging Time: 2 hours",
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                "is_active": True,
                "created_by": 1,
            },
            {
                "name": "Organic Cotton T-Shirt",
                "description": "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.",
                "category": "clothing",
                "price": 29.99,
                "stock": 50,
                "discount": None,
                "specifications": "Material: 100% Organic Cotton\nSizes: XS, S, M, L, XL, XXL\nColors: White, Black, Navy, Gray\nCare: Machine washable\nOrigin: Ethically sourced",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                "is_active": True,
                "created_by": 1,
            },
            {
                "name": "JavaScript: The Complete Guide",
                "description": "Comprehensive guide to modern JavaScript development. Perfect for beginners and experienced developers.",
                "category": "books",
                "price": 49.99,
                "stock": 30,
                "discount": 20.0,
                "specifications": "Pages: 850\nPublisher: Tech Books Inc.\nEdition: 2024\nLanguage: English\nFormat: Paperback & Digital\nISBN: 978-1234567890",
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
                "is_active": True,
                "created_by": 1,
            },
        ]

        insert_query = """
        INSERT IGNORE INTO products (name, description, category, price, stock, discount, specifications, image_url, is_active, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """

        for product in sample_products:
            cursor.execute(
                insert_query,
                (
                    product["name"],
                    product["description"],
                    product["category"],
                    product["price"],
                    product["stock"],
                    product["discount"],
                    product["specifications"],
                    product["image_url"],
                    product["is_active"],
                    product["created_by"],
                ),
            )

        print(f"✅ Added {len(sample_products)} sample products")

        # Verify the data
        cursor.execute("SELECT id, name, category, price FROM products")
        products = cursor.fetchall()
        print("📋 Products in database:")
        for product in products:
            print(f"   - {product[0]}: {product[1]} ({product[2]}) - ${product[3]}")

        return True

    except Error as e:
        print(f"❌ Failed to add products: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def main():
    """Main function to fix data issues"""
    print("🔧 Fixing database data issues...")
    print("=" * 50)

    # Fix posts data
    if fix_posts_data():
        print("✅ Posts data fixed successfully")
    else:
        print("❌ Failed to fix posts data")

    print()

    # Fix products data
    if fix_products_data():
        print("✅ Products data fixed successfully")
    else:
        print("❌ Failed to fix products data")

    print("\n🎉 Data fixes completed!")
    print("Your Azure database now has sample data for testing.")


if __name__ == "__main__":
    main()
