-- =========================================================
-- MODULE 3: VIEWS (The "Simple & Secure" Reports)
-- Client Request:
-- "Our managers want a simple way to see project progress
-- and total worker costs without accessing raw tables directly."
-- =========================================================


-- =========================================================
-- PART 3A: Guided Activity - Creating a Basic View
-- =========================================================
-- Task: Create a view that shows each project’s name, site city,
-- manager name, and start date for quick dashboard access.

CREATE OR REPLACE VIEW vw_project_summary AS
SELECT 
    p.project_id,
    p.project_name,
    p.site_city,
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
    p.start_date
FROM projects p
JOIN managers m ON p.manager_id = m.manager_id;

-- Test the view
SELECT * FROM vw_project_summary;


-- =========================================================
-- PART 3B: Guided Activity - Aggregation View
-- =========================================================
-- Task: Create a view that shows each project’s total number
-- of assigned workers and the total estimated labor cost.

CREATE OR REPLACE VIEW vw_project_costs AS
SELECT 
    p.project_id,
    p.project_name,
    COUNT(a.worker_id) AS total_workers,
    SUM(w.hourly_rate * a.hours_worked) AS total_labor_cost
FROM projects p
JOIN assignments a ON p.project_id = a.project_id
JOIN workers w ON a.worker_id = w.worker_id
GROUP BY p.project_id, p.project_name;

-- Test the view
SELECT * FROM vw_project_costs;


-- =========================================================
-- PART 3C: Challenge Task - Secure Manager Dashboard View
-- =========================================================
-- Client Request:
-- "Managers should be able to view their own projects with
-- total workers and costs, but without seeing other managers’ data."

-- Solution: Create a secure, parameterized manager view

CREATE OR REPLACE VIEW vw_manager_dashboard AS
SELECT 
    m.manager_id,
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
    p.project_id,
    p.project_name,
    p.site_city,
    p.start_date,
    COUNT(a.worker_id) AS total_workers,
    SUM(w.hourly_rate * a.hours_worked) AS total_cost
FROM managers m
JOIN projects p ON m.manager_id = p.manager_id
JOIN assignments a ON p.project_id = a.project_id
JOIN workers w ON a.worker_id = w.worker_id
GROUP BY 
    m.manager_id, manager_name, 
    p.project_id, p.project_name, p.site_city, p.start_date;

-- Test the secure view for one manager (example: manager_id = 1)
SELECT * FROM vw_manager_dashboard WHERE manager_id = 1;


-- =========================================================
-- PART 3D: Optional - Limit View Access
-- =========================================================
-- Restrict direct table access and grant view access to managers only.

REVOKE SELECT ON projects, assignments, workers FROM manager;
GRANT SELECT ON vw_manager_dashboard TO manager;
