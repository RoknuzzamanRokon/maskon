#!/usr/bin/env python3
"""
Script to fix invalid specifications data in the products table
"""

import mysql.connector
from mysql.connector import Error
import os
import json
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
        )
        return connection
    except Error as e:
        print(f"Database connection failed: {e}")
        return None


def fix_specifications():
    connection = get_db_connection()
    if not connection:
        return

    cursor = connection.cursor(dictionary=True)

    try:
        # Get all products with specifications
        cursor.execute(
            "SELECT id, name, specifications FROM products WHERE specifications IS NOT NULL AND specifications != ''"
        )
        products = cursor.fetchall()

        print(f"Found {len(products)} products with specifications")

        fixed_count = 0
        for product in products:
            product_id = product["id"]
            product_name = product["name"]
            specs = product["specifications"]

            print(f"\nChecking product {product_id}: {product_name}")
            print(f"Current specs: {repr(specs)}")

            # Check if it's valid JSON
            try:
                parsed = json.loads(specs)
                print("✅ Valid JSON - no changes needed")
                continue
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON: {e}")

                # Check if it's just random characters or corrupted data
                if (
                    len(specs.strip()) < 10
                    and not specs.strip().startswith("[")
                    and not specs.strip().startswith("{")
                ):
                    print("🧹 Clearing corrupted specifications data")
                    cursor.execute(
                        "UPDATE products SET specifications = NULL WHERE id = %s",
                        (product_id,),
                    )
                    fixed_count += 1
                else:
                    # Try to create a simple specification from the text
                    print("🔧 Converting to simple specification format")
                    simple_spec = [
                        {
                            "key": "Description",
                            "value": specs.strip()[:200],
                        }  # Limit to 200 chars
                    ]
                    cursor.execute(
                        "UPDATE products SET specifications = %s WHERE id = %s",
                        (json.dumps(simple_spec), product_id),
                    )
                    fixed_count += 1

        if fixed_count > 0:
            connection.commit()
            print(f"\n✅ Fixed {fixed_count} products with invalid specifications")
        else:
            print("\n✅ No products needed fixing")

    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()


def add_sample_specifications():
    """Add proper specifications to products that don't have any"""
    connection = get_db_connection()
    if not connection:
        return

    cursor = connection.cursor(dictionary=True)

    try:
        # Get products without specifications
        cursor.execute(
            "SELECT id, name, category FROM products WHERE specifications IS NULL OR specifications = ''"
        )
        products = cursor.fetchall()

        print(f"\nAdding sample specifications to {len(products)} products")

        for product in products:
            product_id = product["id"]
            product_name = product["name"]
            category = product["category"]

            # Create category-specific specifications
            if category == "electronics":
                specs = [
                    {"key": "Brand", "value": "Premium Brand"},
                    {"key": "Warranty", "value": "1 Year"},
                    {"key": "Power", "value": "Standard"},
                    {"key": "Connectivity", "value": "Multiple Options"},
                ]
            elif category == "clothing":
                specs = [
                    {"key": "Material", "value": "High Quality Fabric"},
                    {"key": "Care Instructions", "value": "Machine Washable"},
                    {"key": "Fit", "value": "Regular Fit"},
                    {"key": "Origin", "value": "Imported"},
                ]
            elif category == "books":
                specs = [
                    {"key": "Format", "value": "Paperback"},
                    {"key": "Language", "value": "English"},
                    {"key": "Publisher", "value": "Premium Publisher"},
                    {"key": "ISBN", "value": "Available"},
                ]
            else:
                specs = [
                    {"key": "Quality", "value": "Premium"},
                    {"key": "Warranty", "value": "Standard"},
                    {"key": "Origin", "value": "Quality Assured"},
                    {"key": "Support", "value": "Customer Service Available"},
                ]

            cursor.execute(
                "UPDATE products SET specifications = %s WHERE id = %s",
                (json.dumps(specs), product_id),
            )
            print(f"✅ Added specifications to {product_name}")

        connection.commit()
        print(f"\n✅ Added specifications to all products")

    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    print("🔧 Fixing Product Specifications")
    print("=" * 40)

    # First fix any corrupted data
    fix_specifications()

    # Then add specifications to products that don't have any
    add_sample_specifications()

    print("\n🎉 Specifications cleanup complete!")
