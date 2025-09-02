#!/usr/bin/env python3
"""
Simple script to test database connection to Azure MySQL
"""
import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def test_db_connection():
    """Test the database connection"""
    try:
        print("Testing database connection...")
        print(f"Host: {os.getenv('DB_HOST')}")
        print(f"Database: {os.getenv('DB_NAME')}")
        print(f"User: {os.getenv('DB_USER')}")

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

        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ Successfully connected to MySQL Server version: {version[0]}")

            # Test a simple query
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"✅ Found {len(tables)} tables in the database")

            cursor.close()
            connection.close()
            print("✅ Database connection test completed successfully!")
            return True

    except Error as e:
        print(f"❌ Database connection failed: {e}")
        print("Trying without SSL verification...")

        # Try with SSL disabled as fallback
        try:
            connection = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                database=os.getenv("DB_NAME", "blog_portfolio"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                ssl_disabled=True,
                port=3306,
            )

            if connection.is_connected():
                cursor = connection.cursor()
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()
                print(f"✅ Connected without SSL to MySQL Server version: {version[0]}")
                cursor.close()
                connection.close()
                return True

        except Error as e2:
            print(f"❌ Connection without SSL also failed: {e2}")
            return False


if __name__ == "__main__":
    test_db_connection()
