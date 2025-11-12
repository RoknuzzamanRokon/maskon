-- ============================================================
-- COMPLETE DATABASE SETUP FOR BLOG & PORTFOLIO WEBSITE
-- ============================================================
-- This file creates all tables and initial data for the project
-- Run this file to set up the complete database from scratch
-- 
-- Features included:
-- - Blog posts (tech, food, activity categories)
-- - Portfolio projects showcase
-- - User authentication & admin system
-- - Post interactions (likes, dislikes, comments)
-- - Anonymous interactions for public visitors
-- - Products catalog with e-commerce features
-- - Real-time chat system for product inquiries
-- - Multiple media support for posts
-- - WhatsApp integration support
-- ============================================================
-- Create and use database
CREATE DATABASE IF NOT EXISTS blog_portfolio;
USE blog_portfolio;
-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
-- ============================================================
-- CORE TABLES
-- ============================================================
-- Users table (Authentication & Authorization)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_admin (is_admin)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Posts table (Blog content)
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
    INDEX idx_tags (tags),
    FULLTEXT idx_title_content (title, content)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Post media table (Multiple images/videos per post)
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Portfolio table (Portfolio projects)
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(500) NOT NULL,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- INTERACTION TABLES (Registered Users)
-- ============================================================
-- Post interactions (Registered users)
CREATE TABLE IF NOT EXISTS post_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Comments (Registered users)
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- ANONYMOUS INTERACTION TABLES (Public Visitors)
-- ============================================================
-- Anonymous interactions (Public visitors)
CREATE TABLE IF NOT EXISTS anonymous_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL,
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_anonymous_interaction (post_id, user_identifier),
    INDEX idx_post_id (post_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Anonymous comments (Public visitors)
CREATE TABLE IF NOT EXISTS anonymous_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- E-COMMERCE TABLES
-- ============================================================
-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Products table
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
    created_by INT DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL,
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at DESC),
        INDEX idx_price (price),
        INDEX idx_stock (stock),
        FULLTEXT idx_name_description (name, description)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Product images (Multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Product inquiries (Customer interest tracking)
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
    responded_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- CHAT SYSTEM TABLES
-- ============================================================
-- Product chat sessions
CREATE TABLE IF NOT EXISTS product_chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    customer_email VARCHAR(255) DEFAULT NULL,
    customer_name VARCHAR(255) DEFAULT NULL,
    status ENUM(
        'active',
        'pending',
        'in_progress',
        'resolved',
        'closed'
    ) DEFAULT 'active',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_admin_id INT DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE
    SET NULL,
        INDEX idx_product_session (product_id, session_id),
        INDEX idx_status (status),
        INDEX idx_last_message (last_message_at DESC),
        INDEX idx_assigned_admin (assigned_admin_id),
        INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Chat messages
CREATE TABLE IF NOT EXISTS product_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    sender_type ENUM('customer', 'admin', 'system') NOT NULL,
    sender_id INT DEFAULT NULL,
    sender_name VARCHAR(255) DEFAULT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'system', 'image', 'file') DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE
    SET NULL,
        INDEX idx_session_created (session_id, created_at),
        INDEX idx_unread (is_read, created_at),
        INDEX idx_sender (sender_type, sender_id),
        INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Chat session metadata
CREATE TABLE IF NOT EXISTS product_chat_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_key (session_id, metadata_key),
    INDEX idx_session_key (session_id, metadata_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- TRIGGERS
-- ============================================================
-- Trigger: Update last_message_at when new message is added
DELIMITER // CREATE TRIGGER IF NOT EXISTS update_session_last_message
AFTER
INSERT ON product_chat_messages FOR EACH ROW BEGIN
UPDATE product_chat_sessions
SET last_message_at = NEW.created_at,
    updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.session_id;
END // DELIMITER;
-- Trigger: Update session status when admin responds
DELIMITER // CREATE TRIGGER IF NOT EXISTS update_session_status_on_admin_response
AFTER
INSERT ON product_chat_messages FOR EACH ROW BEGIN IF NEW.sender_type = 'admin' THEN
UPDATE product_chat_sessions
SET status = CASE
        WHEN status = 'pending' THEN 'in_progress'
        ELSE status
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.session_id;
END IF;
END // DELIMITER;
-- ============================================================
-- VIEWS
-- ============================================================
-- View: Chat sessions overview
CREATE OR REPLACE VIEW chat_sessions_overview AS
SELECT cs.id as session_id,
    cs.session_id as session_key,
    cs.product_id,
    p.name as product_name,
    p.price as product_price,
    cs.customer_email,
    cs.customer_name,
    cs.status,
    cs.priority,
    cs.created_at,
    cs.last_message_at,
    cs.assigned_admin_id,
    u.username as assigned_admin_name,
    COUNT(cm.id) as total_messages,
    COUNT(
        CASE
            WHEN cm.is_read = FALSE
            AND cm.sender_type = 'customer' THEN 1
        END
    ) as unread_customer_messages,
    COUNT(
        CASE
            WHEN cm.is_read = FALSE
            AND cm.sender_type = 'admin' THEN 1
        END
    ) as unread_admin_messages
FROM product_chat_sessions cs
    LEFT JOIN products p ON cs.product_id = p.id
    LEFT JOIN users u ON cs.assigned_admin_id = u.id
    LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
GROUP BY cs.id,
    cs.session_id,
    cs.product_id,
    p.name,
    p.price,
    cs.customer_email,
    cs.customer_name,
    cs.status,
    cs.priority,
    cs.created_at,
    cs.last_message_at,
    cs.assigned_admin_id,
    u.username;
-- View: Recent chat messages
CREATE OR REPLACE VIEW recent_chat_messages AS
SELECT cm.id,
    cm.session_id,
    cs.session_id as session_key,
    cs.product_id,
    p.name as product_name,
    cm.sender_type,
    cm.sender_name,
    cm.message_text,
    cm.message_type,
    cm.is_read,
    cm.created_at,
    cs.customer_email,
    cs.status as session_status
FROM product_chat_messages cm
    JOIN product_chat_sessions cs ON cm.session_id = cs.id
    JOIN products p ON cs.product_id = p.id
ORDER BY cm.created_at DESC;
-- ============================================================
-- STORED PROCEDURES
-- ============================================================
-- Procedure: Create a new chat session
DELIMITER // CREATE PROCEDURE IF NOT EXISTS CreateChatSession(
    IN p_product_id INT,
    IN p_session_id VARCHAR(255),
    IN p_customer_email VARCHAR(255),
    IN p_customer_name VARCHAR(255),
    IN p_initial_message TEXT
) BEGIN
DECLARE session_pk INT;
DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK;
RESIGNAL;
END;
START TRANSACTION;
-- Insert chat session
INSERT INTO product_chat_sessions (
        product_id,
        session_id,
        customer_email,
        customer_name,
        status,
        priority
    )
VALUES (
        p_product_id,
        p_session_id,
        p_customer_email,
        p_customer_name,
        'pending',
        'medium'
    );
SET session_pk = LAST_INSERT_ID();
-- Insert initial message if provided
IF p_initial_message IS NOT NULL
AND p_initial_message != '' THEN
INSERT INTO product_chat_messages (
        session_id,
        sender_type,
        sender_name,
        message_text,
        message_type
    )
VALUES (
        session_pk,
        'customer',
        p_customer_name,
        p_initial_message,
        'text'
    );
END IF;
COMMIT;
SELECT session_pk as session_id;
END // DELIMITER;
-- Procedure: Send a chat message
DELIMITER // CREATE PROCEDURE IF NOT EXISTS SendChatMessage(
    IN p_session_key VARCHAR(255),
    IN p_sender_type ENUM('customer', 'admin', 'system'),
    IN p_sender_id INT,
    IN p_sender_name VARCHAR(255),
    IN p_message_text TEXT,
    IN p_message_type ENUM('text', 'system', 'image', 'file')
) BEGIN
DECLARE session_pk INT;
DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK;
RESIGNAL;
END;
START TRANSACTION;
-- Get session primary key
SELECT id INTO session_pk
FROM product_chat_sessions
WHERE session_id = p_session_key;
IF session_pk IS NULL THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Chat session not found';
END IF;
-- Insert message
INSERT INTO product_chat_messages (
        session_id,
        sender_type,
        sender_id,
        sender_name,
        message_text,
        message_type
    )
VALUES (
        session_pk,
        p_sender_type,
        p_sender_id,
        p_sender_name,
        p_message_text,
        COALESCE(p_message_type, 'text')
    );
COMMIT;
SELECT LAST_INSERT_ID() as message_id;
END // DELIMITER;
-- ============================================================
-- INITIAL DATA
-- ============================================================
-- Insert default admin user
-- Username: maskon123, Password: maskon123maskon
INSERT INTO users (
        username,
        email,
        password_hash,
        is_admin,
        created_at
    )
VALUES (
        'maskon123',
        'admin@maskon.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L3jzZvUxO',
        TRUE,
        NOW()
    ) ON DUPLICATE KEY
UPDATE username = username;
-- Insert test user
-- Username: testuser, Password: user123
INSERT INTO users (username, email, password_hash, is_admin)
VALUES (
        'testuser',
        'user@example.com',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        FALSE
    ) ON DUPLICATE KEY
UPDATE username = username;
-- Insert sample blog posts
INSERT INTO posts (title, content, category, tags, image_url)
VALUES (
        'Getting Started with FastAPI',
        'FastAPI is a modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints. It offers automatic API documentation, data validation, and high performance.',
        'tech',
        'python,fastapi,api,backend',
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800'
    ),
    (
        'Best Practices for React Development',
        'Learn about the best practices for building scalable React applications including component structure, state management, and performance optimization.',
        'tech',
        'react,javascript,frontend,webdev',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
    ),
    (
        'My Favorite Pasta Recipe',
        'Today I want to share my favorite pasta recipe that I learned from my grandmother. This authentic Italian carbonara is creamy, delicious, and surprisingly simple to make.',
        'food',
        'pasta,italian,cooking,recipe',
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
    ),
    (
        'Healthy Breakfast Ideas',
        'Start your day right with these nutritious and delicious breakfast options that are quick to prepare and full of energy.',
        'food',
        'breakfast,healthy,nutrition,meal-prep',
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
    ),
    (
        'Morning Workout Routine',
        'Started my day with a 30-minute workout session. Here is my complete routine including warm-up, exercises, and cool-down stretches.',
        'activity',
        'fitness,morning,workout,health',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
    ),
    (
        'Weekend Hiking Adventure',
        'Explored a beautiful mountain trail this weekend. The views were breathtaking and the fresh air was invigorating!',
        'activity',
        'hiking,outdoor,adventure,nature',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'
    ) ON DUPLICATE KEY
UPDATE title = title;
-- Insert sample portfolio projects
INSERT INTO portfolio (
        title,
        description,
        technologies,
        project_url,
        github_url,
        image_url
    )
VALUES (
        'E-commerce Website',
        'A full-stack e-commerce platform with payment integration, user authentication, shopping cart, and order management system.',
        'React, Node.js, MongoDB, Stripe, Redux',
        'https://myecommerce.com',
        'https://github.com/user/ecommerce',
        'https://images.unsplash.com/photo-1557821552-17105176677c?w=800'
    ),
    (
        'Task Management App',
        'A collaborative task management application with real-time updates, team collaboration features, and deadline tracking.',
        'Vue.js, Express.js, Socket.io, PostgreSQL',
        'https://mytasks.com',
        'https://github.com/user/taskapp',
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800'
    ),
    (
        'Weather Dashboard',
        'A responsive weather dashboard with location-based forecasts, interactive maps, and weather alerts.',
        'React, OpenWeather API, Chart.js, Tailwind CSS',
        'https://myweather.com',
        'https://github.com/user/weather',
        'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800'
    ),
    (
        'Blog Platform',
        'A modern blogging platform with markdown support, comment system, and social media integration.',
        'Next.js, FastAPI, MySQL, TailwindCSS',
        'https://myblog.com',
        'https://github.com/user/blog',
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'
    ) ON DUPLICATE KEY
UPDATE title = title;
-- Insert product categories
INSERT INTO product_categories (name, description, is_active)
VALUES (
        'electronics',
        'Electronic devices and gadgets',
        TRUE
    ),
    ('clothing', 'Clothing and fashion items', TRUE),
    ('books', 'Books and educational materials', TRUE),
    (
        'accessories',
        'Various accessories and add-ons',
        TRUE
    ),
    ('home', 'Home and living products', TRUE) ON DUPLICATE KEY
UPDATE name = name;
-- Insert sample products
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
        'Bluetooth 5.0, Battery Life: 30 hours, Noise Cancellation: Active, Weight: 250g, Frequency Response: 20Hz - 20kHz, Charging Time: 2 hours',
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
        'Material: 100% Organic Cotton, Sizes: XS, S, M, L, XL, XXL, Colors: White, Black, Navy, Gray, Care: Machine washable, Origin: Ethically sourced',
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
        'Pages: 850, Publisher: Tech Books Inc., Edition: 2024, Language: English, Format: Paperback & Digital, ISBN: 978-1234567890',
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
        'Material: Genuine Leather, Laptop Size: Up to 15.6 inches, Dimensions: 16" x 12" x 4", Weight: 2.5 lbs, Color: Brown, Black, Warranty: 2 years',
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
        'Display: 1.4" AMOLED, Battery: 7 days, Water Resistance: 5ATM, GPS: Built-in, Health Monitoring: Heart rate, Sleep, Steps, Compatibility: iOS & Android',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        TRUE,
        1
    ),
    (
        'Modern Desk Lamp',
        'LED desk lamp with adjustable brightness and color temperature. Energy efficient and eye-friendly.',
        'home',
        45.99,
        35,
        NULL,
        'LED Type: SMD, Power: 10W, Brightness Levels: 5, Color Temperature: 3000K-6500K, USB Charging Port: Yes, Material: Aluminum alloy',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
        TRUE,
        1
    ) ON DUPLICATE KEY
UPDATE name = name;
-- ============================================================
-- DATABASE SETUP COMPLETE
-- ============================================================
-- Display table information
SELECT TABLE_NAME,
    TABLE_ROWS,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'blog_portfolio'
ORDER BY TABLE_NAME;
-- Success message
SELECT 'Database setup completed successfully!' AS Status,
    'Database: blog_portfolio' AS Database_Name,
    'Total Tables Created' AS Info,
    'Default Admin: maskon123 / maskon123maskon' AS Admin_Credentials,
    'Test User: testuser / user123' AS Test_User_Credentials;