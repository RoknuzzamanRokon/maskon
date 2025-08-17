#!/usr/bin/env python3
"""
Setup script for products database
Run this script to create the products tables and sample data
"""

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()


def setup_products_database():
    try:
        # Connect to database
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "blog_portfolio"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
        )

        cursor = connection.cursor()

        print("🔄 Setting up products database...")

        # Read and execute the SQL setup file
        with open("database/setup_products.sql", "r") as file:
            sql_commands = file.read()

        # Split commands by semicolon and execute each one
        commands = [cmd.strip() for cmd in sql_commands.split(";") if cmd.strip()]

        for command in commands:
            if command.upper().startswith("SELECT"):
                cursor.execute(command)
                result = cursor.fetchone()
                if result:
                    print(f"✅ {result[0]}")
                # Consume any remaining results
                try:
                    while cursor.nextset():
                        pass
                except:
                    pass
            else:
                cursor.execute(command)
                connection.commit()
                # Consume any remaining results
                try:
                    while cursor.nextset():
                        pass
                except:
                    pass

        print("✅ Products database setup completed successfully!")
        print("\n📊 Database Summary:")

        # Show table counts
        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]
        print(f"   • Products: {product_count}")

        cursor.execute("SELECT COUNT(*) FROM product_images")
        image_count = cursor.fetchone()[0]
        print(f"   • Product Images: {image_count}")

        cursor.execute("SELECT COUNT(*) FROM product_categories")
        category_count = cursor.fetchone()[0]
        print(f"   • Categories: {category_count}")

        print(f"\n🚀 You can now:")
        print(f"   • Visit http://localhost:3000/products to see the products page")
        print(
            f"   • Visit http://localhost:3000/admin/products to manage products (admin only)"
        )
        print(f"   • Test the multiple image gallery on product detail pages")

    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except FileNotFoundError:
        print("❌ Could not find database/setup_products.sql file")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if "cursor" in locals():
            cursor.close()
        if "connection" in locals():
            connection.close()

    return True


if __name__ == "__main__":
    print("🛍️ Products Database Setup")
    print("=" * 50)

    if setup_products_database():
        print("\n🎉 Setup completed successfully!")
    else:
        print("\n💥 Setup failed. Please check the error messages above.")
