-- Add anonymous interactions table for public likes/dislikes
USE blog_portfolio;
-- Anonymous interactions table (for visitors without accounts)
CREATE TABLE IF NOT EXISTS anonymous_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL,
    -- IP-based identifier like "anon_192.168.1.1"
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_anonymous_interaction (post_id, user_identifier)
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
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);