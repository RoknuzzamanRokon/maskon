#!/usr/bin/env python3
"""
Database setup script for chat functionality
This script creates the necessary tables for the product chat system
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            autocommit=True,
        )
        return connection
    except mysql.connector.Error as e:
        print(f"Error connecting to database: {e}")
        return None


def run_sql_file(connection, file_path):
    """Execute SQL commands from a file"""
    try:
        cursor = connection.cursor()

        with open(file_path, "r", encoding="utf-8") as file:
            sql_content = file.read()

        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]

        for statement in statements:
            if statement and not statement.startswith("--"):
                try:
                    cursor.execute(statement)
                    print(f"✓ Executed: {statement[:50]}...")
                except mysql.connector.Error as e:
                    print(f"✗ Error executing statement: {e}")
                    print(f"Statement: {statement[:100]}...")

        cursor.close()
        print(f"✓ Successfully executed {file_path}")
        return True

    except Exception as e:
        print(f"✗ Error reading/executing {file_path}: {e}")
        return False


def verify_tables(connection):
    """Verify that chat tables were created successfully"""
    try:
        cursor = connection.cursor()

        # Check for chat tables
        cursor.execute(
            """
            SELECT TABLE_NAME, TABLE_ROWS 
            FROM information_schema.tables 
            WHERE table_schema = %s 
            AND table_name LIKE %s
            ORDER BY table_name
        """,
            (os.getenv("DB_NAME", "blog_portfolio"), "%chat%"),
        )

        tables = cursor.fetchall()

        if tables:
            print("\n✓ Chat tables created successfully:")
            for table_name, row_count in tables:
                print(f"  - {table_name} ({row_count} rows)")
        else:
            print("\n✗ No chat tables found")
            return False

        # Check for views
        cursor.execute(
            """
            SELECT TABLE_NAME 
            FROM information_schema.views 
            WHERE table_schema = %s 
            AND table_name LIKE %s
            ORDER BY table_name
        """,
            (os.getenv("DB_NAME", "blog_portfolio"), "%chat%"),
        )

        views = cursor.fetchall()

        if views:
            print("\n✓ Chat views created successfully:")
            for (view_name,) in views:
                print(f"  - {view_name}")

        cursor.close()
        return True

    except Exception as e:
        print(f"✗ Error verifying tables: {e}")
        return False


def main():
    """Main setup function"""
    print("🚀 Setting up chat functionality database...")
    print("=" * 50)

    # Connect to database
    connection = get_db_connection()
    if not connection:
        print("✗ Failed to connect to database")
        return False

    print("✓ Connected to database")

    # Run migration script
    migration_file = "database/simple_chat_migration.sql"
    if os.path.exists(migration_file):
        print(f"\n📄 Running migration: {migration_file}")
        if not run_sql_file(connection, migration_file):
            print("✗ Migration failed")
            connection.close()
            return False
    else:
        print(f"✗ Migration file not found: {migration_file}")
        connection.close()
        return False

    # Verify setup
    print("\n🔍 Verifying database setup...")
    if verify_tables(connection):
        print("\n🎉 Chat functionality database setup completed successfully!")
        print("\nNext steps:")
        print("1. Start implementing the backend API endpoints")
        print("2. Create the frontend chat components")
        print("3. Test the chat functionality")
    else:
        print("\n❌ Database setup verification failed")
        connection.close()
        return False

    connection.close()
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
