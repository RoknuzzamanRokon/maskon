"""
Migration script to add updated_at column to portfolio table
"""

import os
import sys
import mysql.connector
from dotenv import load_dotenv

# Add parent directory to path to import from backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


def get_connection():
    """Create database connection"""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "blog_portfolio"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        ssl_disabled=False,
        port=3306,
    )


def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute(
        """
        SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = %s 
        AND column_name = %s
    """,
        (table_name, column_name),
    )

    result = cursor.fetchone()
    return result[0] > 0


def add_updated_at_column():
    """Add updated_at column to portfolio table"""
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        print("Checking portfolio table structure...")

        # Check if updated_at column exists
        if check_column_exists(cursor, "portfolio", "updated_at"):
            print("✓ Column 'updated_at' already exists in portfolio table")
            return True

        print("Adding 'updated_at' column to portfolio table...")

        # Add the column
        cursor.execute(
            """
            ALTER TABLE portfolio 
            ADD COLUMN updated_at TIMESTAMP 
            DEFAULT CURRENT_TIMESTAMP 
            ON UPDATE CURRENT_TIMESTAMP 
            AFTER created_at
        """
        )

        connection.commit()
        print("✓ Successfully added 'updated_at' column to portfolio table")

        # Verify the change
        cursor.execute("DESCRIBE portfolio")
        columns = cursor.fetchall()

        print("\nPortfolio table structure:")
        print("-" * 80)
        for col in columns:
            print(f"  {col[0]:<20} {col[1]:<30} {col[2]:<10}")
        print("-" * 80)

        return True

    except mysql.connector.Error as e:
        print(f"✗ Database error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("\nDatabase connection closed")


def main():
    print("=" * 80)
    print("Portfolio Table Migration - Add updated_at Column")
    print("=" * 80)
    print()

    success = add_updated_at_column()

    print()
    if success:
        print("✓ Migration completed successfully!")
        print("\nYou can now:")
        print("  1. Restart your backend server")
        print(
            "  2. Try creating a portfolio item at http://localhost:3000/admin/portfolio/new"
        )
    else:
        print("✗ Migration failed. Please check the error messages above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
