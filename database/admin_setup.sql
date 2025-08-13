-- Admin-only setup for blog system
USE blog_portfolio;
-- Clear existing users
DELETE FROM users;
-- Create your admin account
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
    );
-- Note: The password hash above is for 'maskon123maskon'
-- If you want to use a different password, you'll need to generate a new hash