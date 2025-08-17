-- Setup script for products system
-- Run this after your main database setup
USE blog_portfolio;
-- Products table for e-commerce functionality
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    discount DECIMAL(5, 2) DEFAULT NULL,
    -- Percentage discount (0-100)
    specifications TEXT DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
-- Product images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
-- Product categories table for better organization
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default categories
INSERT IGNORE INTO product_categories (name, description)
VALUES ('electronics', 'Electronic devices and gadgets'),
    ('clothing', 'Clothing and fashion items'),
    ('books', 'Books and educational materials'),
    ('accessories', 'Various accessories and add-ons');
-- Product inquiries table to track customer interest
CREATE TABLE IF NOT EXISTS product_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'purchase',
    -- purchase, question, etc.
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, responded, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_status ON product_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_created_at ON product_inquiries(created_at);
-- Sample products for testing (only insert if no products exist)
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
SELECT *
FROM (
        SELECT 'Premium Wireless Headphones' as name,
            'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.' as description,
            'electronics' as category,
            299.99 as price,
            25 as stock,
            15.0 as discount,
            'Bluetooth 5.0\nBattery Life: 30 hours\nNoise Cancellation: Active\nWeight: 250g\nFrequency Response: 20Hz - 20kHz\nCharging Time: 2 hours' as specifications,
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' as image_url,
            TRUE as is_active,
            1 as created_by
        UNION ALL
        SELECT 'Organic Cotton T-Shirt',
            'Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.',
            'clothing',
            29.99,
            50,
            NULL,
            'Material: 100% Organic Cotton\nSizes: XS, S, M, L, XL, XXL\nColors: White, Black, Navy, Gray\nCare: Machine washable\nOrigin: Ethically sourced',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            TRUE,
            1
        UNION ALL
        SELECT 'JavaScript: The Complete Guide',
            'Comprehensive guide to modern JavaScript development. Perfect for beginners and experienced developers.',
            'books',
            49.99,
            30,
            20.0,
            'Pages: 850\nPublisher: Tech Books Inc.\nEdition: 2024\nLanguage: English\nFormat: Paperback & Digital\nISBN: 978-1234567890',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
            TRUE,
            1
        UNION ALL
        SELECT 'Leather Laptop Bag',
            'Premium leather laptop bag with multiple compartments. Perfect for professionals and students.',
            'accessories',
            89.99,
            15,
            10.0,
            'Material: Genuine Leather\nLaptop Size: Up to 15.6 inches\nDimensions: 16" x 12" x 4"\nWeight: 2.5 lbs\nColor: Brown, Black\nWarranty: 2 years',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
            TRUE,
            1
        UNION ALL
        SELECT 'Smart Fitness Watch',
            'Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity.',
            'electronics',
            199.99,
            40,
            25.0,
            'Display: 1.4" AMOLED\nBattery: 7 days\nWater Resistance: 5ATM\nGPS: Built-in\nHealth Monitoring: Heart rate, Sleep, Steps\nCompatibility: iOS & Android',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            TRUE,
            1
    ) AS tmp
WHERE NOT EXISTS (
        SELECT 1
        FROM products
        LIMIT 1
    );
-- Show success message
SELECT 'Products database setup completed successfully!' as message;