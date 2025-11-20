-- Active: 1763657175116@@127.0.0.1@3306@big3_construction
-- =========================================================
-- BIG3 CONSTRUCTION - PHASE 1 DATABASE SETUP
-- This script creates the database and all tables according to
-- the 5NF schema required for Phase 2
-- =========================================================

-- Create the database
DROP DATABASE IF EXISTS big3_construction;
CREATE DATABASE big3_construction;
USE big3_construction;

-- =========================================================
-- TABLE: clients
-- =========================================================
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL UNIQUE,
    client_phone VARCHAR(20)
);

-- =========================================================
-- TABLE: projects
-- =========================================================
CREATE TABLE projects (
    project_id VARCHAR(10) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    site_address VARCHAR(200),
    site_city VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    client_id INT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- =========================================================
-- TABLE: workers
-- =========================================================
CREATE TABLE workers (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    salary DECIMAL(10, 2)
);

-- =========================================================
-- TABLE: skills
-- =========================================================
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- TABLE: worker_skills (Junction table)
-- =========================================================
CREATE TABLE worker_skills (
    worker_id INT,
    skill_id INT,
    PRIMARY KEY (worker_id, skill_id),
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

-- =========================================================
-- TABLE: certifications
-- =========================================================
CREATE TABLE certifications (
    cert_id INT AUTO_INCREMENT PRIMARY KEY,
    cert_name VARCHAR(100) NOT NULL,
    expiry_date DATE,
    worker_id INT,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

-- =========================================================
-- TABLE: project_assignments
-- =========================================================
CREATE TABLE project_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT,
    project_id VARCHAR(10),
    assignment_date DATE,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- =========================================================
-- TABLE: suppliers
-- =========================================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_phone VARCHAR(20)
);

-- =========================================================
-- TABLE: materials
-- =========================================================
CREATE TABLE materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL
);

-- =========================================================
-- TABLE: project_materials
-- =========================================================
CREATE TABLE project_materials (
    project_material_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(10),
    material_id INT,
    supplier_id INT,
    quantity INT NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- =========================================================
-- Verification
-- =========================================================
SHOW TABLES;

SELECT 'Database setup complete!' AS Status;
