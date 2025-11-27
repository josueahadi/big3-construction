-- =============================================
-- BIG3 CONSTRUCTION - DATABASE MIGRATIONS
-- This script adds new tables and columns required for the
-- backend application (users, geospatial data, multilingual support)
-- =============================================

USE big3_construction;

-- Disable safe update mode for this migration
SET SQL_SAFE_UPDATES = 0;

-- =============================================
-- GEOSPATIAL SEARCH MIGRATION
-- =============================================

-- Add geospatial columns to projects table (safe version - checks if columns exist)
SET @db_name = DATABASE();
SET @latitude_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @db_name 
    AND TABLE_NAME = 'projects' 
    AND COLUMN_NAME = 'latitude'
);

SET @longitude_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @db_name 
    AND TABLE_NAME = 'projects' 
    AND COLUMN_NAME = 'longitude'
);

-- Add latitude column if it doesn't exist
SET @sql_latitude = IF(@latitude_exists = 0,
    'ALTER TABLE projects ADD COLUMN latitude DECIMAL(10, 8) NULL COMMENT "Latitude coordinate"',
    'SELECT "Column latitude already exists" AS Info'
);
PREPARE stmt FROM @sql_latitude;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add longitude column if it doesn't exist
SET @sql_longitude = IF(@longitude_exists = 0,
    'ALTER TABLE projects ADD COLUMN longitude DECIMAL(11, 8) NULL COMMENT "Longitude coordinate"',
    'SELECT "Column longitude already exists" AS Info'
);
PREPARE stmt FROM @sql_longitude;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for performance on geospatial queries (safe version - checks if index exists)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = @db_name 
    AND TABLE_NAME = 'projects' 
    AND INDEX_NAME = 'idx_projects_coordinates'
);

SET @sql_index = IF(@index_exists = 0,
    'CREATE INDEX idx_projects_coordinates ON projects(latitude, longitude)',
    'SELECT "Index idx_projects_coordinates already exists" AS Info'
);
PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- MULTILINGUAL SUPPORT MIGRATION
-- =============================================

-- Create users table for authentication with i18n support
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'PM', 'Site Supervisor') NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en' COMMENT 'User preferred language (en, es)',
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

-- =============================================
-- BACKFILL COORDINATES FOR EXISTING PROJECTS
-- Supports both Ghana and Rwanda cities (Rwandan cities added for testing)
-- =============================================

-- GHANA CITIES (matching default sample data)
-- -----------------------------------------------

-- Accra (Capital city, Southern Ghana)
UPDATE projects
SET latitude = 5.6037, longitude = -0.1870
WHERE site_city = 'Accra' AND (latitude IS NULL OR longitude IS NULL);

-- Kumasi (Second largest city, Ashanti Region)
UPDATE projects
SET latitude = 6.6885, longitude = -1.6244
WHERE site_city = 'Kumasi' AND (latitude IS NULL OR longitude IS NULL);

-- Takoradi (Western Region, Port city)
UPDATE projects
SET latitude = 4.8845, longitude = -1.7554
WHERE site_city = 'Takoradi' AND (latitude IS NULL OR longitude IS NULL);

-- Tamale (Northern Region)
UPDATE projects
SET latitude = 9.4034, longitude = -0.8424
WHERE site_city = 'Tamale' AND (latitude IS NULL OR longitude IS NULL);

-- Cape Coast (Central Region, Historical city)
UPDATE projects
SET latitude = 5.1053, longitude = -1.2466
WHERE site_city = 'Cape Coast' AND (latitude IS NULL OR longitude IS NULL);

-- Tema (Port city near Accra)
UPDATE projects
SET latitude = 5.6698, longitude = 0.0166
WHERE site_city = 'Tema' AND (latitude IS NULL OR longitude IS NULL);

-- RWANDA CITIES (alternative sample data for testing)
-- -----------------------------------------------

-- Kigali (Capital city)
UPDATE projects
SET latitude = -1.9536, longitude = 30.0606
WHERE site_city = 'Kigali' AND (latitude IS NULL OR longitude IS NULL);

-- Huye (Southern Province)
UPDATE projects
SET latitude = -2.5958, longitude = 29.7466
WHERE site_city = 'Huye' AND (latitude IS NULL OR longitude IS NULL);

-- Muhanga (Southern Province)
UPDATE projects
SET latitude = -2.0839, longitude = 29.7390
WHERE site_city = 'Muhanga' AND (latitude IS NULL OR longitude IS NULL);

-- Kayonza (Eastern Province)
UPDATE projects
SET latitude = -1.6776, longitude = 30.0878
WHERE site_city = 'Kayonza' AND (latitude IS NULL OR longitude IS NULL);

-- Rubavu (Western Province)
UPDATE projects
SET latitude = -1.5000, longitude = 29.6000
WHERE site_city = 'Rubavu' AND (latitude IS NULL OR longitude IS NULL);

-- =============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =============================================

-- Verify geospatial columns were added
SELECT 'Checking projects table columns...' AS Status;
DESCRIBE projects;

-- Check how many projects have coordinates
SELECT
    'Projects with coordinates:' AS Status,
    COUNT(*) AS total_projects,
    SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) AS with_coordinates,
    SUM(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 ELSE 0 END) AS without_coordinates
FROM projects;

-- Show sample of projects with coordinates
SELECT
    'Sample projects with coordinates:' AS Status,
    project_id,
    project_name,
    site_city,
    latitude,
    longitude
FROM projects
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
LIMIT 5;

-- Verify users table was created
SELECT 'Checking users table...' AS Status;
DESCRIBE users;

-- Show project indexes
SELECT 'Project indexes:' AS Status;
SHOW INDEX FROM projects WHERE Key_name = 'idx_projects_coordinates';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

SELECT '✅ Migration 07 completed successfully!' AS Status;
