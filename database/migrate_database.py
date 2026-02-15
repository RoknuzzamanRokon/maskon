#!/usr/bin/env python3
"""
Database Migration Script
Migrates all tables to the new database specified in .env file
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration from .env
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "charset": "utf8mb4",
    "collation": "utf8mb4_unicode_ci",
}


def read_sql_file(filepath):
    """Read SQL file and return its content"""
    try:
        with open(filepath, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
        return None


def execute_sql_script(cursor, sql_script):
    """Execute SQL script with multiple statements"""
    # Split by delimiter and execute each statement
    statements = []
    current_statement = []
    in_delimiter_block = False

    for line in sql_script.split("\n"):
        line = line.strip()

        # Skip comments and empty lines
        if not line or line.startswith("--"):
            continue

        # Handle DELIMITER changes
        if line.startswith("DELIMITER"):
            in_delimiter_block = not in_delimiter_block
            continue

        current_statement.append(line)

        # Check for statement end
        if in_delimiter_block:
            if line.endswith("//"):
                statements.append(" ".join(current_statement))
                current_statement = []
        else:
            if line.endswith(";"):
                statements.append(" ".join(current_statement))
                current_statement = []

    # Execute each statement
    success_count = 0
    error_count = 0

    for statement in statements:
        if not statement.strip():
            continue

        try:
            # Remove trailing delimiter
            statement = statement.rstrip(";").rstrip("//")
            if statement.strip():
                cursor.execute(statement)
                success_count += 1
        except Error as e:
            # Ignore "already exists" errors
            if "already exists" not in str(e).lower():
                print(f"Warning: {e}")
                error_count += 1

    return success_count, error_count


def migrate_database():
    """Main migration function"""
    print("=" * 60)
    print("DATABASE MIGRATION SCRIPT")
    print("=" * 60)
    print(f"\nTarget Database: {DB_CONFIG['database']}")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"User: {DB_CONFIG['user']}")
    print("\n" + "=" * 60)

    connection = None

    try:
        # Connect to MySQL server
        print("\n[1/4] Connecting to database...")
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✓ Connected successfully!")

        # Read and execute the complete database setup
        print("\n[2/4] Reading migration script...")
        sql_script = read_sql_file("database/complete_database_setup.sql")

        if not sql_script:
            print("✗ Failed to read migration script!")
            return False

        print("✓ Migration script loaded!")

        # Execute migration
        print("\n[3/4] Executing migration...")
        print("This may take a few moments...")

        success_count, error_count = execute_sql_script(cursor, sql_script)
        connection.commit()

        print(f"✓ Migration completed!")
        print(f"  - Statements executed: {success_count}")
        if error_count > 0:
            print(f"  - Warnings: {error_count}")

        # Verify tables
        print("\n[4/4] Verifying tables...")
        cursor.execute(f"USE {DB_CONFIG['database']}")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        print(f"\n✓ Database setup complete!")
        print(f"\nTotal tables created: {len(tables)}")
        print("\nTables:")
        for table in sorted(tables):
            print(f"  • {table[0]}")

        # Display credentials
        print("\n" + "=" * 60)
        print("DEFAULT CREDENTIALS")
        print("=" * 60)
        print("Admin User:")
        print("  Username: maskon123")
        print("  Password: maskon123maskon")
        print("\nTest User:")
        print("  Username: testuser")
        print("  Password: user123")
        print("=" * 60)

        return True

    except Error as e:
        print(f"\n✗ Database error: {e}")
        return False

    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("\n✓ Database connection closed.")


if __name__ == "__main__":
    try:
        success = migrate_database()
        if success:
            print("\n✓ Migration completed successfully!")
            exit(0)
        else:
            print("\n✗ Migration failed!")
            exit(1)
    except KeyboardInterrupt:
        print("\n\n✗ Migration cancelled by user.")
        exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        exit(1)
