-- Create database
CREATE DATABASE IF NOT EXISTS blog_portfolio;
USE blog_portfolio;
-- Posts table
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('tech', 'food', 'activity') NOT NULL,
    tags VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Portfolio table
CREATE TABLE portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(500) NOT NULL,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert sample data
INSERT INTO posts (title, content, category, tags, image_url)
VALUES (
        'Getting Started with FastAPI',
        'FastAPI is a modern, fast web framework for building APIs with Python...',
        'tech',
        'python,fastapi,api',
        'https://example.com/fastapi.jpg'
    ),
    (
        'My Favorite Pasta Recipe',
        'Today I want to share my favorite pasta recipe that I learned from my grandmother...',
        'food',
        'pasta,italian,cooking',
        'https://example.com/pasta.jpg'
    ),
    (
        'Morning Workout Routine',
        'Started my day with a 30-minute workout session. Here is what I did...',
        'activity',
        'fitness,morning,workout',
        'https://example.com/workout.jpg'
    );
INSERT INTO portfolio (
        title,
        description,
        technologies,
        project_url,
        github_url,
        image_url
    )
VALUES (
        'E-commerce Website',
        'A full-stack e-commerce platform with payment integration',
        'React, Node.js, MongoDB, Stripe',
        'https://myecommerce.com',
        'https://github.com/user/ecommerce',
        'https://example.com/ecommerce.jpg'
    ),
    (
        'Task Management App',
        'A collaborative task management application with real-time updates',
        'Vue.js, Express.js, Socket.io, PostgreSQL',
        'https://mytasks.com',
        'https://github.com/user/taskapp',
        'https://example.com/taskapp.jpg'
    ),
    (
        'Weather Dashboard',
        'A responsive weather dashboard with location-based forecasts',
        'React, OpenWeather API, Chart.js',
        'https://myweather.com',
        'https://github.com/user/weather',
        'https://example.com/weather.jpg'
    );