
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_admin (is_admin)
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('tech', 'food', 'activity') NOT NULL,
    tags VARCHAR(255),
    image_url VARCHAR(500),
    media_urls JSON DEFAULT NULL,
    likes_count INT DEFAULT 0,
    dislikes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_likes_count (likes_count DESC),
    FULLTEXT idx_title_content (title, content)
);
-- Portfolio table for showcasing projects
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(500) NOT NULL,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ==== == == == == == == == == == == == == == == == == == == == == == == == == = -- INTERACTION TABLES
-- =====================================================
-- Post interactions table (likes/dislikes for registered admin_users)
CREATE TABLE IF NOT EXISTS post_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX idx_post_interaction (post_id, interaction_type)
);
-- Anonymous interactions table (for visitors without accounts)
CREATE TABLE IF NOT EXISTS anonymous_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL,
    -- IP-based identifier like "anon_192.168.1.1"
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_anonymous_interaction (post_id, user_identifier),
    INDEX idx_post_anonymous (post_id, interaction_type)
);
-- Comments table for registered admin_users
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_post_comments (post_id, created_at DESC)
);
-- Anonymous comments table (for visitors without accounts)
CREATE TABLE IF NOT EXISTS anonymous_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL,
    -- IP-based identifier
    username VARCHAR(50) NOT NULL,
    -- Display name entered by user
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_anonymous_comments (post_id, created_at DESC)
);
-- === == == == == == == == == == == == == == == == == == == == == == == == == == -- MEDIA SUPPORT TABLES
-- =====================================================
-- Post media table (for multiple images/videos per post)
CREATE TABLE IF NOT EXISTS post_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    media_order INT DEFAULT 0,
    original_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_media (post_id, media_order)
);
-- =====================================================
-- PRODUCT TABLES
-- =====================================================
-- Product categories table for better organization
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);
-- Products table for e-commerce functionality
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INTEGER DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE
    SET NULL,
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at DESC),
        INDEX idx_price (price),
        INDEX idx_stock (stock),
        FULLTEXT idx_name_description (name, description)
);
-- Product images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images (product_id, is_primary)
);
-- Product inquiries table to track customer interest
CREATE TABLE IF NOT EXISTS product_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INTEGER NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'purchase',
    -- purchase, question, etc.
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, responded, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_inquiries_product_id (product_id),
    INDEX idx_product_inquiries_status (status),
    INDEX idx_product_inquiries_created_at (created_at DESC)
);
-- =====================================================
-- SAMPLE DATA
-- =====================================================
-- Create default admin user (password: admin123)
-- Note: Change this password in production!


-- INSERT IGNORE INTO admin_users (username, email, password_hash, is_admin)
-- VALUES (
--         'admin',
--         'admin@example.com',
--         '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L3jzZvUxO',
--         TRUE
--     );
-- -- Create a regular user for testing (password: user123)
-- INSERT IGNORE INTO admin_users (username, email, password_hash, is_admin)
-- VALUES (
--         'testuser',
--         'user@example.com',
--         '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
--         FALSE
--     );





-- Insert default product categories
INSERT IGNORE INTO product_categories (name, description)
VALUES ('electronics', 'Electronic devices and gadgets'),
    ('clothing', 'Clothing and fashion items'),
    ('books', 'Books and educational materials'),
    ('accessories', 'Various accessories and add-ons');
-- Insert sample posts
INSERT IGNORE INTO posts (title, content, category, tags, image_url)
VALUES (
        'Getting Started with FastAPI',
        'FastAPI is a modern, fast web framework for building APIs with Python...',
        'tech',
        'python,fastapi,api',
        'https://example.com/fastapi.jpg'
    ),
    (
        'My Favorite Pasta Recipe',
        'Today I want to share my favorite pasta recipe that I learned from my grandmother...',
        'food',
        'pasta,italian,cooking',
        'https://example.com/pasta.jpg'
    ),
    (
        'Morning Workout Routine',
        'Started my day with a 30-minute workout session. Here is what I did...',
        'activity',
        'fitness,morning,workout',
        'https://example.com/workout.jpg'
    );
-- Insert sample portfolio items
INSERT IGNORE INTO portfolio (
        title,
        description,
        technologies,
        project_url,
        github_url,
        image_url
    )
VALUES (
        'E-commerce Website',
        'A full-stack e-commerce platform with payment integration',
        'React, Node.js, MongoDB, Stripe',
        'https://myecommerce.com',
        'https://github.com/user/ecommerce',
        'https://example.com/ecommerce.jpg'
    ),
    (
        'Task Management App',
        'A collaborative task management application with real-time updates',
        'Vue.js, Express.js, Socket.io, PostgreSQL',
        'https://mytasks.com',
        'https://github.com/user/taskapp',
        'https://example.com/taskapp.jpg'
    ),
    (
        'Weather Dashboard',
        'A responsive weather dashboard with location-based forecasts',
        'React, OpenWeather API, Chart.js',
        'https://myweather.com',
        'https://github.com/user/weather',
        'https://example.com/weather.jpg'
    );
-- Insert sample products
INSERT IGNORE INTO products (
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
        'Bluetooth 5.0\nBattery Life: 30 hours\nNoise Cancellation: Active\nWeight: 250g\nFrequency Response: 20Hz - 20kHz\nCharging Time: 2 hours',
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
        'Material: 100% Organic Cotton\nSizes: XS, S, M, L, XL, XXL\nColors: White, Black, Navy, Gray\nCare: Machine washable\nOrigin: Ethically sourced',
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
        'Pages: 850\nPublisher: Tech Books Inc.\nEdition: 2024\nLanguage: English\nFormat: Paperback & Digital\nISBN: 978-1234567890',
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
        'Material: Genuine Leather\nLaptop Size: Up to 15.6 inches\nDimensions: 16" x 12" x 4"\nWeight: 2.5 lbs\nColor: Brown, Black\nWarranty: 2 years',
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
        'Display: 1.4" AMOLED\nBattery: 7 days\nWater Resistance: 5ATM\nGPS: Built-in\nHealth Monitoring: Heart rate, Sleep, Steps\nCompatibility: iOS & Android',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        TRUE,
        1
    );
-- == == == == == == == == == == == == == == == == == == == == == == == == == == = -- PERFORMANCE OPTIMIZATION
-- =====================================================
-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_category_created ON posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================
-- Table comments for documentation
ALTER TABLE admin_users COMMENT = 'User accounts for authentication and authorization';
ALTER TABLE posts COMMENT = 'Blog posts with categories and media support';
ALTER TABLE portfolio COMMENT = 'Portfolio items showcasing projects and skills';
ALTER TABLE products COMMENT = 'Product catalog for e-commerce functionality';
ALTER TABLE product_inquiries COMMENT = 'Customer inquiries for products';
-- =====================================================
-- SECURITY NOTES
-- =====================================================
/*
 SECURITY RECOMMENDATIONS:
 1. Change default admin password immediately in production
 2. Use environment variables for database credentials
 3. Implement proper input validation and sanitization
 4. Use prepared statements to prevent SQL injection
 5. Implement rate limiting for API endpoints
 6. Use HTTPS in production
 7. Regularly backup the database
 8. Monitor for suspicious activity
 9. Implement proper session management
 10. Use strong password policies
 
 PERFORMANCE RECOMMENDATIONS:
 1. Monitor query performance and add indexes as needed
 2. Implement database connection pooling
 3. Use caching for frequently accessed data
 4. Archive old data periodically
 5. Monitor database size and optimize storage
 */
-- Show table information for verification
-- SELECT TABLE_NAME,
--     TABLE_COMMENT,
--     TABLE_ROWS
-- FROM INFORMATION_SCHEMA.TABLES
-- WHERE TABLE_SCHEMA = 'blog_portfolio'
-- ORDER BY TABLE_NAME;
-- =====================================================
-- END OF SCHEMA
-- =====================================================