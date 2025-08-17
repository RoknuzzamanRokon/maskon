#!/usr/bin/env python3
"""
Simple setup script for products database
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
            autocommit=True,
        )

        cursor = connection.cursor()

        print("🔄 Setting up products database...")

        # Create tables one by one
        print("📋 Creating products table...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            discount DECIMAL(5, 2) DEFAULT NULL,
            specifications TEXT DEFAULT NULL,
            image_url TEXT DEFAULT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by INT DEFAULT NULL
        )
        """
        )

        print("🖼️ Creating product_images table...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            image_url TEXT NOT NULL,
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """
        )

        print("📂 Creating product_categories table...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS product_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )

        print("📞 Creating product_inquiries table...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS product_inquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(50),
            message TEXT,
            inquiry_type VARCHAR(50) DEFAULT 'purchase',
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            responded_at TIMESTAMP NULL,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """
        )

        # Insert categories
        print("📁 Inserting categories...")
        cursor.execute(
            """
        INSERT IGNORE INTO product_categories (name, description) VALUES 
        ('electronics', 'Electronic devices and gadgets'),
        ('clothing', 'Clothing and fashion items'),
        ('books', 'Books and educational materials'),
        ('accessories', 'Various accessories and add-ons')
        """
        )

        # Check if products already exist
        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]

        if product_count == 0:
            print("🛍️ Inserting sample products...")

            # Insert products one by one
            products = [
                (
                    "Premium Wireless Headphones",
                    "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
                    "electronics",
                    299.99,
                    25,
                    15.0,
                    "Bluetooth 5.0\\nBattery Life: 30 hours\\nNoise Cancellation: Active\\nWeight: 250g\\nFrequency Response: 20Hz - 20kHz\\nCharging Time: 2 hours",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                ),
                (
                    "Organic Cotton T-Shirt",
                    "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.",
                    "clothing",
                    29.99,
                    50,
                    None,
                    "Material: 100% Organic Cotton\\nSizes: XS, S, M, L, XL, XXL\\nColors: White, Black, Navy, Gray\\nCare: Machine washable\\nOrigin: Ethically sourced",
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                ),
                (
                    "JavaScript: The Complete Guide",
                    "Comprehensive guide to modern JavaScript development. Perfect for beginners and experienced developers.",
                    "books",
                    49.99,
                    30,
                    20.0,
                    "Pages: 850\\nPublisher: Tech Books Inc.\\nEdition: 2024\\nLanguage: English\\nFormat: Paperback & Digital\\nISBN: 978-1234567890",
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
                ),
                (
                    "Leather Laptop Bag",
                    "Premium leather laptop bag with multiple compartments. Perfect for professionals and students.",
                    "accessories",
                    89.99,
                    15,
                    10.0,
                    'Material: Genuine Leather\\nLaptop Size: Up to 15.6 inches\\nDimensions: 16" x 12" x 4"\\nWeight: 2.5 lbs\\nColor: Brown, Black\\nWarranty: 2 years',
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
                ),
                (
                    "Smart Fitness Watch",
                    "Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity.",
                    "electronics",
                    199.99,
                    40,
                    25.0,
                    'Display: 1.4" AMOLED\\nBattery: 7 days\\nWater Resistance: 5ATM\\nGPS: Built-in\\nHealth Monitoring: Heart rate, Sleep, Steps\\nCompatibility: iOS & Android',
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                ),
            ]

            for product in products:
                cursor.execute(
                    """
                INSERT INTO products (name, description, category, price, stock, discount, specifications, image_url, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
                """,
                    product,
                )

            print("🖼️ Inserting sample images...")

            # Get product IDs and insert images
            cursor.execute("SELECT id, name FROM products")
            products_data = cursor.fetchall()

            # Define images for each product
            product_images = {
                "Premium Wireless Headphones": [
                    (
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                        True,
                    ),
                    (
                        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
                        False,
                    ),
                ],
                "Organic Cotton T-Shirt": [
                    (
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                        True,
                    ),
                    (
                        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
                        False,
                    ),
                ],
                "JavaScript: The Complete Guide": [
                    (
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
                        True,
                    ),
                    (
                        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
                        False,
                    ),
                ],
                "Leather Laptop Bag": [
                    (
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
                        True,
                    ),
                    (
                        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500",
                        False,
                    ),
                ],
                "Smart Fitness Watch": [
                    (
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                        True,
                    ),
                    (
                        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
                        False,
                    ),
                    (
                        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500",
                        False,
                    ),
                ],
            }

            for product_id, product_name in products_data:
                if product_name in product_images:
                    for image_url, is_primary in product_images[product_name]:
                        cursor.execute(
                            """
                        INSERT INTO product_images (product_id, image_url, is_primary)
                        VALUES (%s, %s, %s)
                        """,
                            (product_id, image_url, is_primary),
                        )

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
        print(
            f"   • Try http://localhost:3000/products/3 for the JavaScript book with 4 images"
        )

    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
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
    print("🛍️ Products Database Setup (Simple)")
    print("=" * 50)

    if setup_products_database():
        print("\n🎉 Setup completed successfully!")
    else:
        print("\n💥 Setup failed. Please check the error messages above.")
