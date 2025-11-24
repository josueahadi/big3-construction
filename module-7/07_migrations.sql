-- =============================================
-- SUMMATIVE TASKS 3 & 4: DATABASE MIGRATION
-- Big3 Construction Management Dashboard
-- =============================================

USE big3_construction;

-- =============================================
-- TASK 3: GEOSPATIAL SEARCH MIGRATION
-- =============================================

-- Add geospatial columns to projects table
ALTER TABLE projects 
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL;

-- Add index for performance on geospatial queries
CREATE INDEX idx_projects_coordinates ON projects(latitude, longitude);

-- =============================================
-- TASK 4: MULTILINGUAL SUPPORT MIGRATION
-- =============================================

-- Create users table if it doesn't exist (for Habib's Task 1)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'PM', 'Site Supervisor') NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    worker_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE SET NULL
);

-- =============================================
-- BACKFILL COORDINATES FOR EXISTING PROJECTS
-- Using real Rwanda coordinates
-- =============================================

-- Update existing projects with real coordinates
UPDATE projects SET latitude = -1.9536, longitude = 30.0606 WHERE site_city = 'Kigali';
UPDATE projects SET latitude = -2.5958, longitude = 29.7466 WHERE site_city = 'Huye';
UPDATE projects SET latitude = -2.0839, longitude = 29.7390 WHERE site_city = 'Muhanga';
UPDATE projects SET latitude = -1.6776, longitude = 30.0878 WHERE site_city = 'Kayonza';
UPDATE projects SET latitude = -1.5000, longitude = 29.6000 WHERE site_city = 'Rubavu';

-- =============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =============================================

-- Verify the migration worked:
-- SELECT project_id, project_name, site_city, latitude, longitude FROM projects;
-- DESCRIBE users; (should show preferred_language column)