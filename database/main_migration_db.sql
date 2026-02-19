-- ============================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Blog & Portfolio Website with E-commerce and Chat System
-- ============================================================
-- This script creates all tables, indexes, triggers, views, and stored procedures
-- Run this script to set up the complete database schema
-- ============================================================
-- Use the database (change if needed)
USE mashkon_db;
-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
-- ============================================================
-- DROP EXISTING TABLES (if needed for clean migration)
-- ============================================================
-- Uncomment the following section if you want to drop all tables first
/*
 DROP TABLE IF EXISTS product_chat_metadata;
 DROP TABLE IF EXISTS product_chat_messages;
 DROP TABLE IF EXISTS product_chat_sessions;
 DROP TABLE IF EXISTS product_inquiries;
 DROP TABLE IF EXISTS product_images;
 DROP TABLE IF EXISTS products;
 DROP TABLE IF EXISTS product_categories;
 DROP TABLE IF EXISTS admin_notifications;
 DROP TABLE IF EXISTS anonymous_comments;
 DROP TABLE IF EXISTS anonymous_interactions;
 DROP TABLE IF EXISTS comments;
 DROP TABLE IF EXISTS post_interactions;
 DROP TABLE IF EXISTS post_media;
 DROP TABLE IF EXISTS subscribers;
 DROP TABLE IF EXISTS portfolio;
 DROP TABLE IF EXISTS posts;
 DROP TABLE IF EXISTS users;
 */
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
-- Posts table (Blog content with media support)
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
-- Post media table (Multiple media files per post)
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
-- Subscribers table (Newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(100) DEFAULT 'homepage',
    status ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id VARCHAR(64) PRIMARY KEY,
    admin_id INT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('system', 'user', 'content', 'security') DEFAULT 'system',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    source VARCHAR(255),
    metadata JSON DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_read (admin_id, is_read),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_priority (priority)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- INTERACTION TABLES
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
-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_session_last_message;
DROP TRIGGER IF EXISTS update_session_status_on_admin_response;
-- Trigger: Update last_message_at when new message is added
DELIMITER // CREATE TRIGGER update_session_last_message
AFTER
INSERT ON product_chat_messages FOR EACH ROW BEGIN
UPDATE product_chat_sessions
SET last_message_at = NEW.created_at,
    updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.session_id;
END // DELIMITER;
-- Trigger: Update session status when admin responds
DELIMITER // CREATE TRIGGER update_session_status_on_admin_response
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
-- Drop views if they exist
DROP VIEW IF EXISTS chat_sessions_overview;
DROP VIEW IF EXISTS recent_chat_messages;
-- View: Chat sessions overview
CREATE VIEW chat_sessions_overview AS
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
CREATE VIEW recent_chat_messages AS
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
-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS CreateChatSession;
DROP PROCEDURE IF EXISTS SendChatMessage;
-- Procedure: Create a new chat session
DELIMITER // CREATE PROCEDURE CreateChatSession(
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
DELIMITER // CREATE PROCEDURE SendChatMessage(
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
-- INSERT DEFAULT DATA
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
-- ============================================================
-- DISPLAY TABLE INFORMATION
-- ============================================================
SELECT TABLE_NAME,
    TABLE_ROWS,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 'Database migration completed successfully!' AS Status,
    DATABASE() AS Database_Name,
    'Default Admin: maskon123 / maskon123maskon' AS Admin_Credentials,
    NOW() AS Migration_Timestamp;