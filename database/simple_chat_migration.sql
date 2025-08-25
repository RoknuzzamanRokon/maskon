-- Simple migration script for chat functionality
-- This creates the chat tables without complex prepared statements
USE blog_portfolio;
-- Create product_chat_sessions table
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
    INDEX idx_product_id (product_id),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status),
    INDEX idx_last_message (last_message_at DESC),
    INDEX idx_created_at (created_at DESC)
);
-- Create product_chat_messages table
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
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at),
    INDEX idx_unread (is_read, created_at),
    INDEX idx_sender (sender_type, sender_id)
);
-- Create product_chat_metadata table
CREATE TABLE IF NOT EXISTS product_chat_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_session_key (session_id, metadata_key),
    INDEX idx_session_key (session_id, metadata_key)
);
-- Add foreign key constraints after tables are created
-- We'll add these manually to avoid constraint issues during creation
-- Add foreign key for product_chat_sessions -> products
-- Note: Only add if products table exists
SET @products_exists = (
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'blog_portfolio'
            AND table_name = 'products'
    );
-- Add foreign key for product_chat_messages -> product_chat_sessions
ALTER TABLE product_chat_messages
ADD CONSTRAINT fk_messages_session FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE;
-- Add foreign key for product_chat_metadata -> product_chat_sessions
ALTER TABLE product_chat_metadata
ADD CONSTRAINT fk_metadata_session FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE;
-- Create views for easier querying
CREATE OR REPLACE VIEW chat_sessions_overview AS
SELECT cs.id as session_id,
    cs.session_id as session_key,
    cs.product_id,
    cs.customer_email,
    cs.customer_name,
    cs.status,
    cs.priority,
    cs.created_at,
    cs.last_message_at,
    cs.assigned_admin_id,
    COUNT(cm.id) as total_messages,
    COUNT(
        CASE
            WHEN cm.is_read = FALSE
            AND cm.sender_type = 'customer' THEN 1
        END
    ) as unread_customer_messages
FROM product_chat_sessions cs
    LEFT JOIN product_chat_messages cm ON cs.id = cm.session_id
GROUP BY cs.id,
    cs.session_id,
    cs.product_id,
    cs.customer_email,
    cs.customer_name,
    cs.status,
    cs.priority,
    cs.created_at,
    cs.last_message_at,
    cs.assigned_admin_id;
-- Show created tables
SELECT TABLE_NAME as table_name,
    TABLE_ROWS as estimated_rows
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name LIKE '%chat%'
ORDER BY table_name;