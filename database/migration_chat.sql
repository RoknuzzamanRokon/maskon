-- Migration script to add chat functionality to existing database
-- This script can be run safely on an existing database
USE blog_portfolio;
-- Check if chat tables already exist before creating them
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name = 'product_chat_sessions';
-- Only create tables if they don't exist
SET @sql = IF(
        @table_exists = 0,
        'CREATE TABLE product_chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL UNIQUE,
        customer_email VARCHAR(255) DEFAULT NULL,
        customer_name VARCHAR(255) DEFAULT NULL,
        status ENUM(''active'', ''pending'', ''in_progress'', ''resolved'', ''closed'') DEFAULT ''active'',
        priority ENUM(''low'', ''medium'', ''high'') DEFAULT ''medium'',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_admin_id INT DEFAULT NULL,
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_product_session (product_id, session_id),
        INDEX idx_status (status),
        INDEX idx_last_message (last_message_at DESC),
        INDEX idx_assigned_admin (assigned_admin_id),
        INDEX idx_created_at (created_at DESC)
    )',
        'SELECT ''Table product_chat_sessions already exists'' as message'
    );
PREPARE stmt
FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- Check and create product_chat_messages table
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name = 'product_chat_messages';
SET @sql = IF(
        @table_exists = 0,
        'CREATE TABLE product_chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        sender_type ENUM(''customer'', ''admin'', ''system'') NOT NULL,
        sender_id INT DEFAULT NULL,
        sender_name VARCHAR(255) DEFAULT NULL,
        message_text TEXT NOT NULL,
        message_type ENUM(''text'', ''system'', ''image'', ''file'') DEFAULT ''text'',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_session_created (session_id, created_at),
        INDEX idx_unread (is_read, created_at),
        INDEX idx_sender (sender_type, sender_id),
        INDEX idx_created_at (created_at DESC)
    )',
        'SELECT ''Table product_chat_messages already exists'' as message'
    );
PREPARE stmt
FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- Check and create product_chat_metadata table
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name = 'product_chat_metadata';
SET @sql = IF(
        @table_exists = 0,
        'CREATE TABLE product_chat_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        metadata_key VARCHAR(100) NOT NULL,
        metadata_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (session_id) REFERENCES product_chat_sessions(id) ON DELETE CASCADE,
        
        UNIQUE KEY unique_session_key (session_id, metadata_key),
        INDEX idx_session_key (session_id, metadata_key)
    )',
        'SELECT ''Table product_chat_metadata already exists'' as message'
    );
PREPARE stmt
FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- Check if triggers exist before creating them
SET @trigger_exists = 0;
SELECT COUNT(*) INTO @trigger_exists
FROM information_schema.triggers
WHERE trigger_schema = 'blog_portfolio'
    AND trigger_name = 'update_session_last_message';
-- Create trigger only if it doesn't exist
SET @sql = IF(
        @trigger_exists = 0,
        'CREATE TRIGGER update_session_last_message 
        AFTER INSERT ON product_chat_messages
        FOR EACH ROW
    BEGIN
        UPDATE product_chat_sessions 
        SET last_message_at = NEW.created_at,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.session_id;
    END',
        'SELECT ''Trigger update_session_last_message already exists'' as message'
    );
-- Note: We need to handle the delimiter for triggers differently in a migration
-- For now, we'll create a simpler version or handle this in the application
-- Create views (these will be replaced if they exist)
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
-- Verify the migration
SELECT 'Migration completed successfully' as status,
    COUNT(*) as chat_tables_created
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name LIKE '%chat%';
-- Show the new tables
SELECT TABLE_NAME as table_name,
    TABLE_ROWS as estimated_rows,
    CREATE_TIME as created_at
FROM information_schema.tables
WHERE table_schema = 'blog_portfolio'
    AND table_name LIKE '%chat%'
ORDER BY table_name;