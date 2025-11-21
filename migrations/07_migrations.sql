-- =========================================================
-- BIG3 CONSTRUCTION - PHASE 2 DATABASE MIGRATIONS
-- This script adds new tables and columns required for the
-- backend application (users, geospatial data)
-- =========================================================

USE big3_construction;

-- =========================================================
-- MIGRATION 1: Create users table for authentication
-- =========================================================
-- This table stores user accounts for the application
-- Each user is linked to a worker (workers who have app access)

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'PM', 'Site Supervisor') NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    worker_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key to workers table
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE SET NULL,

    -- Indexes for performance
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_worker_id (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- MIGRATION 2: Add geospatial columns to projects table
-- =========================================================
-- Add latitude and longitude for location-based searches

-- Note: Run this migration only once. If columns already exist, skip or drop them first.
ALTER TABLE projects
ADD COLUMN latitude DECIMAL(10, 8) NULL COMMENT 'Latitude coordinate',
ADD COLUMN longitude DECIMAL(11, 8) NULL COMMENT 'Longitude coordinate';

-- Create index for geospatial queries
CREATE INDEX idx_projects_coordinates
ON projects(latitude, longitude);

-- =========================================================
-- MIGRATION 3: Backfill coordinates for existing projects
-- =========================================================
-- Populate lat/lng for existing projects based on Ghana cities
-- Coordinates are approximate city centers

-- Accra (Capital city)
UPDATE projects
SET latitude = 5.6037, longitude = -0.1870
WHERE site_city = 'Accra' AND (latitude IS NULL OR longitude IS NULL);

-- Kumasi (Second largest city)
UPDATE projects
SET latitude = 6.6885, longitude = -1.6244
WHERE site_city = 'Kumasi' AND (latitude IS NULL OR longitude IS NULL);

-- Takoradi (Western region)
UPDATE projects
SET latitude = 4.8845, longitude = -1.7554
WHERE site_city = 'Takoradi' AND (latitude IS NULL OR longitude IS NULL);

-- Tamale (Northern region)
UPDATE projects
SET latitude = 9.4034, longitude = -0.8424
WHERE site_city = 'Tamale' AND (latitude IS NULL OR longitude IS NULL);

-- Cape Coast
UPDATE projects
SET latitude = 5.1053, longitude = -1.2466
WHERE site_city = 'Cape Coast' AND (latitude IS NULL OR longitude IS NULL);

-- Tema
UPDATE projects
SET latitude = 5.6698, longitude = 0.0166
WHERE site_city = 'Tema' AND (latitude IS NULL OR longitude IS NULL);

-- =========================================================
-- MIGRATION 4: Create audit log for user actions (Optional)
-- =========================================================
-- This table can be used to track user activities for security

CREATE TABLE IF NOT EXISTS user_activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_activity_user_id (user_id),
    INDEX idx_user_activity_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================

-- Check if users table was created
SELECT 'Checking users table...' AS Status;
DESCRIBE users;

-- Check if geospatial columns were added
SELECT 'Checking projects table columns...' AS Status;
DESCRIBE projects;

-- Check how many projects have coordinates
SELECT
    'Projects with coordinates:' AS Status,
    COUNT(*) AS total_projects,
    SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) AS with_coordinates,
    SUM(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 ELSE 0 END) AS without_coordinates
FROM projects;

-- Show all indexes on projects table
SELECT 'Project indexes:' AS Status;
SHOW INDEX FROM projects;

-- Show all tables
SELECT 'All tables in database:' AS Status;
SHOW TABLES;

SELECT 'Migration completed successfully!' AS Status;
