-- =========================================================
-- BIG3 CONSTRUCTION - SAMPLE DATA
-- This script populates the database with sample data for testing
-- =========================================================

USE big3_construction;

-- =========================================================
-- INSERT: clients
-- =========================================================
INSERT INTO clients (client_name, client_phone) VALUES
('Acme Corporation', '555-0101'),
('Global Industries', '555-0102'),
('City Development LLC', '555-0103'),
('Tech Innovations Inc', '555-0104'),
('Green Energy Solutions', '555-0105');

-- =========================================================
-- INSERT: projects
-- =========================================================
INSERT INTO projects (project_id, project_name, site_address, site_city, start_date, end_date, budget, client_id) VALUES
('P001', 'Downtown Plaza', '100 Main St', 'Accra', '2024-01-15', '2024-12-31', 500000.00, 1),
('P002', 'Highway Bridge', '50 River Rd', 'Kumasi', '2024-02-01', NULL, 750000.00, 2),
('P003', 'Office Complex', '200 Business Ave', 'Accra', '2024-03-10', NULL, 1200000.00, 3),
('P004', 'Shopping Mall', '300 Commerce Blvd', 'Takoradi', '2023-06-01', '2024-06-30', 2000000.00, 4),
('P005', 'Solar Farm', '400 Green Way', 'Tamale', '2024-04-01', NULL, 3000000.00, 5);

-- =========================================================
-- INSERT: workers
-- =========================================================
INSERT INTO workers (first_name, last_name, phone, salary) VALUES
('John', 'Johnson', '555-1001', 65000.00),
('Maria', 'Garcia', '555-1002', 72000.00),
('David', 'Smith', '555-1003', 58000.00),
('Sarah', 'Williams', '555-1004', 81000.00),
('Michael', 'Brown', '555-1005', 69000.00),
('Jennifer', 'Davis', '555-1006', 75000.00),
('Robert', 'Miller', '555-1007', 62000.00),
('Lisa', 'Wilson', '555-1008', 78000.00);

-- =========================================================
-- INSERT: skills
-- =========================================================
INSERT INTO skills (skill_name) VALUES
('Heavy Equipment Operation'),
('Welding'),
('Electrical Work'),
('Plumbing'),
('Carpentry'),
('Project Management'),
('Concrete Work'),
('Blueprint Reading');

-- =========================================================
-- INSERT: worker_skills
-- =========================================================
INSERT INTO worker_skills (worker_id, skill_id) VALUES
-- John Johnson has Heavy Equipment and Welding
(1, 1),
(1, 2),
-- Maria Garcia has Electrical and Project Management
(2, 3),
(2, 6),
-- David Smith has Plumbing and Carpentry
(3, 4),
(3, 5),
-- Sarah Williams has Project Management and Blueprint Reading
(4, 6),
(4, 8),
-- Michael Brown has Heavy Equipment and Concrete Work
(5, 1),
(5, 7),
-- Jennifer Davis has Welding and Electrical
(6, 2),
(6, 3),
-- Robert Miller has Carpentry and Concrete Work
(7, 5),
(7, 7),
-- Lisa Wilson has Project Management and Electrical
(8, 6),
(8, 3);

-- =========================================================
-- INSERT: certifications
-- =========================================================
INSERT INTO certifications (cert_name, expiry_date, worker_id) VALUES
('Basic Safety', '2025-12-31', 1),
('Basic Safety', '2026-06-30', 2),
('Basic Safety', '2025-03-15', 3),
('Basic Safety', '2026-09-20', 4),
('Basic Safety', '2025-11-10', 5),
('Basic Safety', '2026-01-25', 6),
('Basic Safety', '2025-08-14', 7),
('Basic Safety', '2026-04-18', 8),
('Forklift Operator', '2025-10-12', 1),
('Electrical License', '2026-02-28', 2),
('Plumbing License', '2025-07-30', 3),
('PMP Certification', '2026-05-15', 4);

-- =========================================================
-- INSERT: project_assignments
-- =========================================================
INSERT INTO project_assignments (worker_id, project_id, assignment_date) VALUES
-- Downtown Plaza (P001) - 4 workers
(1, 'P001', '2024-01-15'),
(2, 'P001', '2024-01-20'),
(3, 'P001', '2024-01-25'),
(4, 'P001', '2024-02-01'),
-- Highway Bridge (P002) - 3 workers
(5, 'P002', '2024-02-01'),
(6, 'P002', '2024-02-05'),
(7, 'P002', '2024-02-10'),
-- Office Complex (P003) - 5 workers (most workers!)
(1, 'P003', '2024-03-10'),
(2, 'P003', '2024-03-12'),
(4, 'P003', '2024-03-15'),
(6, 'P003', '2024-03-18'),
(8, 'P003', '2024-03-20'),
-- Shopping Mall (P004) - 2 workers
(3, 'P004', '2023-06-01'),
(5, 'P004', '2023-06-15'),
-- Solar Farm (P005) - 3 workers
(2, 'P005', '2024-04-01'),
(4, 'P005', '2024-04-05'),
(7, 'P005', '2024-04-10');

-- =========================================================
-- INSERT: suppliers
-- =========================================================
INSERT INTO suppliers (supplier_name, supplier_phone) VALUES
('BuildMart Supplies', '555-2001'),
('Steel & Co', '555-2002'),
('Electric Warehouse', '555-2003'),
('Plumbing Pro', '555-2004'),
('Concrete Masters', '555-2005');

-- =========================================================
-- INSERT: materials
-- =========================================================
INSERT INTO materials (material_name, unit_cost) VALUES
('Cement (50kg bag)', 25.00),
('Steel Rebar (ton)', 850.00),
('Electrical Wire (100m)', 120.00),
('PVC Pipe (3m)', 15.00),
('Lumber (board foot)', 8.50),
('Concrete Mix (cubic meter)', 180.00),
('Roofing Sheets', 45.00),
('Paint (gallon)', 35.00);

-- =========================================================
-- INSERT: project_materials
-- =========================================================
INSERT INTO project_materials (project_id, material_id, supplier_id, quantity, total_cost) VALUES
-- Downtown Plaza materials
('P001', 1, 1, 500, 12500.00),  -- Cement
('P001', 2, 2, 10, 8500.00),     -- Steel
('P001', 3, 3, 50, 6000.00),     -- Wire
('P001', 7, 1, 200, 9000.00),    -- Roofing
-- Highway Bridge materials
('P002', 2, 2, 50, 42500.00),    -- Steel
('P002', 6, 5, 100, 18000.00),   -- Concrete
-- Office Complex materials
('P003', 1, 1, 800, 20000.00),   -- Cement
('P003', 2, 2, 25, 21250.00),    -- Steel
('P003', 3, 3, 100, 12000.00),   -- Wire
('P003', 5, 1, 500, 4250.00),    -- Lumber
('P003', 8, 1, 150, 5250.00),    -- Paint
-- Shopping Mall materials
('P004', 1, 1, 1200, 30000.00),  -- Cement
('P004', 2, 2, 40, 34000.00),    -- Steel
('P004', 6, 5, 200, 36000.00),   -- Concrete
-- Solar Farm materials
('P005', 2, 2, 15, 12750.00),    -- Steel
('P005', 3, 3, 200, 24000.00);   -- Wire

-- =========================================================
-- Verification Queries
-- =========================================================
SELECT 'Data inserted successfully!' AS Status;

SELECT 'Clients:' AS Table_Name, COUNT(*) AS Row_Count FROM clients
UNION ALL
SELECT 'Projects:', COUNT(*) FROM projects
UNION ALL
SELECT 'Workers:', COUNT(*) FROM workers
UNION ALL
SELECT 'Skills:', COUNT(*) FROM skills
UNION ALL
SELECT 'Worker Skills:', COUNT(*) FROM worker_skills
UNION ALL
SELECT 'Certifications:', COUNT(*) FROM certifications
UNION ALL
SELECT 'Project Assignments:', COUNT(*) FROM project_assignments
UNION ALL
SELECT 'Suppliers:', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Materials:', COUNT(*) FROM materials
UNION ALL
SELECT 'Project Materials:', COUNT(*) FROM project_materials;
