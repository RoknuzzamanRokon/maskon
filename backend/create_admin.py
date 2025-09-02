#!/usr/bin/env python3
"""
Admin User Creation Script

This script creates an admin user in the database with the specified credentials.
Usage: python create_admin.py
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import sys

# Load environment variables
load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def get_db_connection():
    """Create database connection"""
    try:
        # Azure MySQL connection with SSL
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            ssl_disabled=False,
            port=3306,
            autocommit=True,
        )
        return connection
    except Error as e:
        print(f"Database connection failed: {e}")
        return None


def create_admin_user(username: str, email: str, password: str):
    """Create an admin user in the database"""

    connection = get_db_connection()
    if not connection:
        print("Failed to connect to database")
        return False

    cursor = connection.cursor()

    try:
        # Check if user already exists
        cursor.execute(
            "SELECT id FROM admin_users WHERE username = %s OR email = %s",
            (username, email),
        )
        existing_user = cursor.fetchone()

        if existing_user:
            print(f"User with username '{username}' or email '{email}' already exists!")
            return False

        # Hash the password
        password_hash = get_password_hash(password)

        # Insert new admin user
        query = """
        INSERT INTO admin_users (username, email, password_hash, is_admin, created_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
        """

        cursor.execute(query, (username, email, password_hash, True))
        connection.commit()

        user_id = cursor.lastrowid
        print(f"✅ Admin user created successfully!")
        print(f"   User ID: {user_id}")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Admin: Yes")

        return True

    except Error as e:
        print(f"❌ Error creating admin user: {e}")
        connection.rollback()
        return False

    finally:
        cursor.close()
        connection.close()


def main():
    """Main function to create the admin user"""

    print("🔧 Creating Admin User")
    print("=" * 40)

    # Admin user credentials
    username = "mashkon"
    email = "mashkon@gmail.com"
    password = "mashkon123"

    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {'*' * len(password)}")
    print()

    # Confirm creation
    confirm = input("Create this admin user? (y/N): ").lower().strip()

    if confirm != "y":
        print("❌ Admin user creation cancelled")
        return

    # Create the admin user
    success = create_admin_user(username, email, password)

    if success:
        print()
        print("🎉 Admin user creation completed!")
        print("You can now login with these credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
    else:
        print("❌ Failed to create admin user")
        sys.exit(1)


if __name__ == "__main__":
    main()
