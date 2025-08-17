-- Products table for e-commerce functionality
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    discount DECIMAL(5, 2) DEFAULT NULL,
    -- Percentage discount (0-100)
    specifications TEXT DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE
    SET NULL
);
-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
-- Product images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Product categories table for better organization
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default categories
INSERT INTO product_categories (name, description)
VALUES ('electronics', 'Electronic devices and gadgets'),
    ('clothing', 'Clothing and fashion items'),
    ('books', 'Books and educational materials'),
    ('accessories', 'Various accessories and add-ons') ON CONFLICT (name) DO NOTHING;
-- Product inquiries table to track customer interest
CREATE TABLE IF NOT EXISTS product_inquiries (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'purchase',
    -- purchase, question, etc.
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, responded, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP DEFAULT NULL
);
-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_status ON product_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_created_at ON product_inquiries(created_at);
-- Sample products for testing
INSERT INTO products (
        name,
        description,
        category,
        price,
        stock,
        discount,
        specifications,
        image_url,
        is_active,
        created_by
    )
VALUES (
        'Premium Wireless Headphones',
        'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
        'electronics',
        299.99,
        25,
        15.0,
        'Bluetooth 5.0
Battery Life: 30 hours
Noise Cancellation: Active
Weight: 250g
Frequency Response: 20Hz - 20kHz
Charging Time: 2 hours',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        TRUE,
        1
    ),
    (
        'Organic Cotton T-Shirt',
        'Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.',
        'clothing',
        29.99,
        50,
        NULL,
        'Material: 100% Organic Cotton
Sizes: XS, S, M, L, XL, XXL
Colors: White, Black, Navy, Gray
Care: Machine washable
Origin: Ethically sourced',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        TRUE,
        1
    ),
    (
        'JavaScript: The Complete Guide',
        'Comprehensive guide to modern JavaScript development. Perfect for beginners and experienced developers.',
        'books',
        49.99,
        30,
        20.0,
        'Pages: 850
Publisher: Tech Books Inc.
Edition: 2024
Language: English
Format: Paperback & Digital
ISBN: 978-1234567890',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        TRUE,
        1
    ),
    (
        'Leather Laptop Bag',
        'Premium leather laptop bag with multiple compartments. Perfect for professionals and students.',
        'accessories',
        89.99,
        15,
        10.0,
        'Material: Genuine Leather
Laptop Size: Up to 15.6 inches
Dimensions: 16" x 12" x 4"
Weight: 2.5 lbs
Color: Brown, Black
Warranty: 2 years',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        TRUE,
        1
    ),
    (
        'Smart Fitness Watch',
        'Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity.',
        'electronics',
        199.99,
        40,
        25.0,
        'Display: 1.4" AMOLED
Battery: 7 days
Water Resistance: 5ATM
GPS: Built-in
Health Monitoring: Heart rate, Sleep, Steps
Compatibility: iOS & Android',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        TRUE,
        1
    ) ON CONFLICT DO NOTHING;
-- Update trigger for products table
CREATE OR REPLACE FUNCTION update_products_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();