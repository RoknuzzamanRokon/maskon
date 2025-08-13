#!/usr/bin/env python3
"""
Script to create admin user with correct password hash
"""
from passlib.context import CryptContext
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    # Your admin credentials
    username = "maskon123"
    password = "maskon123maskon"  # Your specified password
    email = "admin@maskon.com"
    
    # Hash the password
    password_hash = pwd_context.hash(password)
    print(f"Generated password hash: {password_hash}")
    
    # Connect to database
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'blog_portfolio'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        cursor = connection.cursor()
        
        # Clear existing users
        cursor.execute("DELETE FROM users")
        
        # Create admin user
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (%s, %s, %s, %s, NOW())",
            (username, email, password_hash, True)
        )
        
        connection.commit()
        print(f"✅ Admin user created successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Email: {email}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_admin()