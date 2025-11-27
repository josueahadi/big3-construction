-- =========================================================
-- BIG3 CONSTRUCTION - SEED USERS
-- This script creates initial user accounts for testing
-- Passwords are bcrypt hashed with 10 salt rounds
-- =========================================================

USE big3_construction;

-- =========================================================
-- SEED DATA: Initial users for each role
-- =========================================================
-- NOTE: All passwords are 'password123' (hashed)
-- In production, users should change these immediately

-- Password hash for 'password123' with bcrypt (10 rounds)
-- Generated with: const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10);
-- Hash: $2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK

INSERT INTO users (email, password_hash, role, worker_id, preferred_language)
VALUES
-- Admin user (linked to Sarah Williams - worker_id 4)
('admin@big3construction.com',
 '$2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK',
 'Admin',
 4,
 'en'),

-- Project Manager 1 (linked to Maria Garcia - worker_id 2)
('maria.garcia@big3construction.com',
 '$2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK',
 'PM',
 2,
 'en'),

-- Project Manager 2 (linked to Lisa Wilson - worker_id 8)
('lisa.wilson@big3construction.com',
 '$2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK',
 'PM',
 8,
 'es'),

-- Site Supervisor 1 (linked to John Johnson - worker_id 1)
('john.johnson@big3construction.com',
 '$2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK',
 'Site Supervisor',
 1,
 'en'),

-- Site Supervisor 2 (linked to Michael Brown - worker_id 5)
('michael.brown@big3construction.com',
 '$2b$10$MHMrg9IFSyiT/KhNblCMsOyGx6W6t9PYhKDdC4vy/Y6b7q8QFZrkK',
 'Site Supervisor',
 5,
 'en')

ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    worker_id = VALUES(worker_id),
    preferred_language = VALUES(preferred_language);

-- =========================================================
-- VERIFICATION
-- =========================================================

SELECT 'Users seeded successfully!' AS Status;

SELECT
    u.user_id,
    u.email,
    u.role,
    CONCAT(w.first_name, ' ', w.last_name) AS worker_name,
    u.preferred_language,
    u.created_at
FROM users u
LEFT JOIN workers w ON u.worker_id = w.worker_id
ORDER BY u.role, u.email;

-- =========================================================
-- LOGIN CREDENTIALS FOR TESTING
-- =========================================================
/*
IMPORTANT: Use these credentials to test the API

Admin:
Email: admin@big3construction.com
Password: password123
Role: Admin (Full access to all resources)

Project Manager 1:
Email: maria.garcia@big3construction.com
Password: password123
Role: PM (Can manage assigned projects)

Project Manager 2:
Email: lisa.wilson@big3construction.com
Password: password123
Role: PM (Preferred language: Spanish)

Site Supervisor 1:
Email: john.johnson@big3construction.com
Password: password123
Role: Site Supervisor (Read-only access to assigned projects)

Site Supervisor 2:
Email: michael.brown@big3construction.com
Password: password123
Role: Site Supervisor (Read-only access to assigned projects)

SECURITY NOTE:
These are test credentials. In production:
1. Change all passwords immediately
2. Use strong, unique passwords
3. Enable 2FA if available
4. Never commit real passwords to version control
*/
