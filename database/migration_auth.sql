-- Migration to add authentication and user interaction features
USE blog_portfolio;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Post interactions table (likes/dislikes)
CREATE TABLE IF NOT EXISTS post_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id)
);
-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Add columns to posts table for interaction counts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dislikes_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;
-- Create default admin user (password: admin123)
-- Note: Change this password in production!
INSERT IGNORE INTO users (username, email, password_hash, is_admin)
VALUES (
        'admin',
        'admin@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L3jzZvUxO',
        TRUE
    );
-- Create a regular user for testing (password: user123)
INSERT IGNORE INTO users (username, email, password_hash, is_admin)
VALUES (
        'testuser',
        'user@example.com',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        FALSE
    );