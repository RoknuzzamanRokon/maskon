-- Chat functionality schema for product inquiries
-- This extends the existing product system with real-time chat capabilities
USE blog_portfolio;
-- Product chat sessions (replaces/extends the basic product_inquiries table)
CREATE TABLE IF NOT EXISTS product_chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    -- For anonymous user tracking
    customer_email VARCHAR(255) DEFAULT NULL,
    -- Optional for follow-up
    customer_name VARCHAR(255) DEFAULT NULL,
    -- Optional customer name
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
);
-- Chat messages for product conversations
CREATE TABLE IF NOT EXISTS product_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    sender_type ENUM('customer', 'admin', 'system') NOT NULL,
    sender_id INT DEFAULT NULL,
    -- Admin user ID if sender_type is admin
    sender_name VARCHAR(255) DEFAULT NULL,
    -- Display name for the sender
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
);
-- Chat session metadata for additional tracking
CREATE TABLE IF NOT EXISTS product_chat_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_key (session_id, metadata_key),
    INDEX idx_session_key (session_id, metadata_key)
);
-- Trigger to update last_message_at when new message is added
DELIMITER // CREATE TRIGGER update_session_last_message
AFTER
INSERT ON product_chat_messages FOR EACH ROW BEGIN
UPDATE product_chat_sessions
SET last_message_at = NEW.created_at,
    updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.session_id;
END // DELIMITER;
-- Trigger to update session status when admin responds
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
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_id ON products(id);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
-- Insert some sample chat data for testing (optional)
-- This will be populated by the application, but useful for initial testing
-- Sample chat session
INSERT INTO product_chat_sessions (
        product_id,
        session_id,
        customer_email,
        customer_name,
        status,
        priority
    )
VALUES (
        1,
        -- Assuming product ID 1 exists
        'session_' || UNIX_TIMESTAMP() || '_' || FLOOR(RAND() * 1000),
        'customer@example.com',
        'John Doe',
        'pending',
        'medium'
    ) ON DUPLICATE KEY
UPDATE session_id = session_id;
-- Sample messages (will be added by application)
-- These are just for reference and testing
-- View for easy chat session overview
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
-- View for recent messages
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
-- Stored procedure to create a new chat session
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
-- Stored procedure to send a message
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
-- Function to generate unique session ID
DELIMITER // CREATE FUNCTION GenerateSessionId() RETURNS VARCHAR(255) READS SQL DATA DETERMINISTIC BEGIN
DECLARE session_id VARCHAR(255);
DECLARE session_exists INT DEFAULT 1;
WHILE session_exists > 0 DO
SET session_id = CONCAT(
        'chat_',
        UNIX_TIMESTAMP(),
        '_',
        FLOOR(RAND() * 100000)
    );
SELECT COUNT(*) INTO session_exists
FROM product_chat_sessions
WHERE product_chat_sessions.session_id = session_id;
END WHILE;
RETURN session_id;
END // DELIMITER;
-- Add some helpful comments
ALTER TABLE product_chat_sessions COMMENT = 'Stores chat sessions between customers and admins for specific products';
ALTER TABLE product_chat_messages COMMENT = 'Stores individual messages within chat sessions';
ALTER TABLE product_chat_metadata COMMENT = 'Stores additional metadata for chat sessions (user agent, IP, etc.)';
-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON blog_portfolio.product_chat_sessions TO 'your_app_user'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON blog_portfolio.product_chat_messages TO 'your_app_user'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON blog_portfolio.product_chat_metadata TO 'your_app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE blog_portfolio.CreateChatSession TO 'your_app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE blog_portfolio.SendChatMessage TO 'your_app_user'@'%';
-- GRANT EXECUTE ON FUNCTION blog_portfolio.GenerateSessionId TO 'your_app_user'@'%';
-- Show table information
SELECT TABLE_NAME,
    TABLE_COMMENT,
    TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'blog_portfolio'
    AND TABLE_NAME LIKE '%chat%';
-- Show indexes
SELECT TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'blog_portfolio'
    AND TABLE_NAME LIKE '%chat%'
ORDER BY TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX;