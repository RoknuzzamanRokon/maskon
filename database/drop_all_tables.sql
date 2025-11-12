-- ============================================================
-- DROP ALL PROJECT TABLES
-- ============================================================
-- This file removes all tables from the blog_portfolio database
-- WARNING: This will delete all data permanently!
-- Use this to clean up before running complete_database_setup.sql
-- ============================================================
USE blog_portfolio;
-- Disable foreign key checks to avoid constraint errors
SET FOREIGN_KEY_CHECKS = 0;
-- Drop views first
DROP VIEW IF EXISTS chat_sessions_overview;
DROP VIEW IF EXISTS recent_chat_messages;
-- Drop stored procedures
DROP PROCEDURE IF EXISTS CreateChatSession;
DROP PROCEDURE IF EXISTS SendChatMessage;
-- Drop triggers
DROP TRIGGER IF EXISTS update_session_last_message;
DROP TRIGGER IF EXISTS update_session_status_on_admin_response;
-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS product_chat_metadata;
DROP TABLE IF EXISTS product_chat_messages;
DROP TABLE IF EXISTS product_chat_sessions;
DROP TABLE IF EXISTS product_inquiries;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS anonymous_comments;
DROP TABLE IF EXISTS anonymous_interactions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_interactions;
DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS post_media;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
-- Success message
SELECT 'All project tables dropped successfully!' AS Status,
    'Database: blog_portfolio' AS Database_Name,
    'You can now run complete_database_setup.sql to recreate tables' AS Next_Step;