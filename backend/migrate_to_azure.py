#!/usr/bin/env python3
"""
Database Migration Script: Local to Azure MySQL

This script migrates your local database schema and data to Azure MySQL.
It will:
1. Create all tables in Azure MySQL
2. Export data from local database (if exists)
3. Import data to Azure MySQL
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import json
from datetime import datetime

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


def get_local_connection():
    """Get connection to local MySQL database (if exists)"""
    try:
        # Try to connect to local MySQL
        connection = mysql.connector.connect(
            host="localhost",
            database="blog_portfolio",  # Your local database name
            user="root",
            password="",  # Adjust if you have a local MySQL password
            port=3306,
        )
        return connection
    except Error as e:
        print(
            f"ℹ️  Local MySQL connection failed (this is OK if you don't have local data): {e}"
        )
        return None


def create_schema_on_azure():
    """Create the database schema on Azure MySQL"""

    # Read the schema file
    try:
        with open("../database/project_db.sql", "r", encoding="utf-8") as file:
            schema_sql = file.read()
    except FileNotFoundError:
        try:
            with open("database/project_db.sql", "r", encoding="utf-8") as file:
                schema_sql = file.read()
        except FileNotFoundError:
            print("❌ Could not find project_db.sql file")
            return False

    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        print("🔧 Creating database schema on Azure MySQL...")

        # Split the SQL file into individual statements
        statements = []
        current_statement = ""

        for line in schema_sql.split("\n"):
            line = line.strip()

            # Skip comments and empty lines
            if line.startswith("--") or line.startswith("/*") or not line:
                continue

            current_statement += line + " "

            # If line ends with semicolon, it's the end of a statement
            if line.endswith(";"):
                statements.append(current_statement.strip())
                current_statement = ""

        # Execute each statement
        for i, statement in enumerate(statements):
            if statement and not statement.startswith("--"):
                try:
                    cursor.execute(statement)
                    print(f"✅ Executed statement {i+1}/{len(statements)}")
                except Error as e:
                    if "already exists" in str(e).lower():
                        print(f"ℹ️  Statement {i+1} - Table already exists (skipping)")
                    else:
                        print(f"⚠️  Statement {i+1} failed: {e}")

        print("✅ Schema creation completed!")
        return True

    except Error as e:
        print(f"❌ Schema creation failed: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def export_local_data():
    """Export data from local database"""
    local_conn = get_local_connection()
    if not local_conn:
        print("ℹ️  No local database found - will create fresh Azure database")
        return {}

    cursor = local_conn.cursor(dictionary=True)
    exported_data = {}

    # List of tables to export (in order to respect foreign key constraints)
    tables_to_export = [
        "admin_users",
        "product_categories",
        "posts",
        "portfolio",
        "products",
        "product_images",
        "product_inquiries",
        "post_interactions",
        "anonymous_interactions",
        "comments",
        "anonymous_comments",
        "post_media",
    ]

    try:
        print("📤 Exporting data from local database...")

        for table in tables_to_export:
            try:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                exported_data[table] = rows
                print(f"✅ Exported {len(rows)} rows from {table}")
            except Error as e:
                print(f"⚠️  Could not export from {table}: {e}")
                exported_data[table] = []

        return exported_data

    except Error as e:
        print(f"❌ Data export failed: {e}")
        return {}
    finally:
        cursor.close()
        local_conn.close()


def import_data_to_azure(data):
    """Import data to Azure MySQL"""
    if not data:
        print("ℹ️  No data to import")
        return True

    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        print("📥 Importing data to Azure MySQL...")

        # Import data in the same order as export to respect foreign keys
        for table, rows in data.items():
            if not rows:
                print(f"ℹ️  No data to import for {table}")
                continue

            try:
                # Get column names
                columns = list(rows[0].keys())
                placeholders = ", ".join(["%s"] * len(columns))
                columns_str = ", ".join(columns)

                insert_query = f"INSERT IGNORE INTO {table} ({columns_str}) VALUES ({placeholders})"

                # Convert rows to tuples
                values = []
                for row in rows:
                    # Handle JSON fields and None values
                    row_values = []
                    for col in columns:
                        value = row[col]
                        if isinstance(value, dict) or isinstance(value, list):
                            value = json.dumps(value)
                        row_values.append(value)
                    values.append(tuple(row_values))

                cursor.executemany(insert_query, values)
                print(f"✅ Imported {len(rows)} rows to {table}")

            except Error as e:
                print(f"⚠️  Could not import to {table}: {e}")

        print("✅ Data import completed!")
        return True

    except Error as e:
        print(f"❌ Data import failed: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def verify_migration():
    """Verify the migration was successful"""
    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        print("🔍 Verifying migration...")

        # Check tables exist
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]

        print(f"✅ Found {len(tables)} tables in Azure database:")
        for table_name in sorted(table_names):
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"   - {table_name}: {count} rows")

        return True

    except Error as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def create_admin_user():
    """Create default admin user if it doesn't exist"""
    azure_conn = get_azure_connection()
    if not azure_conn:
        return False

    cursor = azure_conn.cursor()

    try:
        # Check if admin user exists
        cursor.execute("SELECT COUNT(*) FROM admin_users WHERE username = 'mashkon'")
        count = cursor.fetchone()[0]

        if count == 0:
            print("👤 Creating default admin user...")

            # Import password hashing
            from passlib.context import CryptContext

            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

            # Create admin user
            password_hash = pwd_context.hash("mashkon123")

            insert_query = """
            INSERT INTO admin_users (username, email, password_hash, is_admin, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            """

            cursor.execute(
                insert_query, ("mashkon", "mashkon@gmail.com", password_hash, True)
            )
            print("✅ Admin user 'mashkon' created successfully!")
            print("   Username: mashkon")
            print("   Password: mashkon123")
        else:
            print("ℹ️  Admin user already exists")

        return True

    except Error as e:
        print(f"❌ Admin user creation failed: {e}")
        return False
    finally:
        cursor.close()
        azure_conn.close()


def main():
    """Main migration function"""
    print("🚀 Starting Database Migration: Local → Azure MySQL")
    print("=" * 60)

    # Step 1: Create schema on Azure
    print("\n📋 Step 1: Creating database schema...")
    if not create_schema_on_azure():
        print("❌ Migration failed at schema creation")
        return

    # Step 2: Export local data (if exists)
    print("\n📤 Step 2: Exporting local data...")
    local_data = export_local_data()

    # Step 3: Import data to Azure
    print("\n📥 Step 3: Importing data to Azure...")
    if not import_data_to_azure(local_data):
        print("❌ Migration failed at data import")
        return

    # Step 4: Create admin user
    print("\n👤 Step 4: Setting up admin user...")
    if not create_admin_user():
        print("❌ Migration failed at admin user creation")
        return

    # Step 5: Verify migration
    print("\n🔍 Step 5: Verifying migration...")
    if not verify_migration():
        print("❌ Migration verification failed")
        return

    print("\n🎉 Migration completed successfully!")
    print("=" * 60)
    print("Your database has been migrated to Azure MySQL.")
    print("You can now use your application with the Azure database.")
    print("\nAdmin Login Credentials:")
    print("Username: mashkon")
    print("Password: mashkon123")
    print("\nNext steps:")
    print("1. Start your FastAPI server: python -m uvicorn main:app --reload")
    print("2. Test the connection: http://localhost:8000/api/health")
    print("3. Login to admin panel with the credentials above")


if __name__ == "__main__":
    main()
