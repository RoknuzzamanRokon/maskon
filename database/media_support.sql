-- Add multiple media support for posts
USE blog_portfolio;
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
-- Add media_urls column to posts table for JSON storage (alternative approach)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS media_urls JSON DEFAULT NULL;