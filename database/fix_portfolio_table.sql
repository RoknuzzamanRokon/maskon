-- Fix portfolio table - Add missing updated_at column
-- This script adds the updated_at column to the portfolio table
USE blog_portfolio;
-- Check if the column exists before adding it
SET @dbname = DATABASE();
SET @tablename = 'portfolio';
SET @columnname = 'updated_at';
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE (table_name = @tablename)
                        AND (table_schema = @dbname)
                        AND (column_name = @columnname)
                ) > 0,
                'SELECT ''Column already exists'' AS message;',
                'ALTER TABLE portfolio ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;'
            )
    );
PREPARE alterIfNotExists
FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
-- Verify the change
DESCRIBE portfolio;
-- Success message
SELECT 'Portfolio table updated successfully!' AS Status,
    'Column updated_at has been added' AS Change;