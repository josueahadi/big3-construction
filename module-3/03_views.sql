-- =========================================================
-- MODULE 3: VIEWS (The "Simple & Secure" Reports)
-- Client Request:
-- "Create safe, simple views for supervisors and the accounting team."
-- =========================================================


-- =========================================================
-- PART 3A: Guided Activity - Supervisor Project View
-- =========================================================
-- Create a secure view that shows project assignments
-- without exposing salaries or client contact information.

CREATE VIEW v_project_worker_assignments AS
SELECT
    p.project_name,
    p.site_address,
    w.first_name,
    w.last_name,
    w.phone,
    pa.assignment_date
FROM projects p
JOIN project_assignments pa ON p.project_id = pa.project_id
JOIN workers w ON pa.worker_id = w.worker_id
ORDER BY p.project_name, w.last_name;


-- Example usage for supervisors:
SELECT * 
FROM v_project_worker_assignments
WHERE project_name = 'Downtown Plaza';


-- =========================================================
-- PART 3B: Challenge Task - Financial Summary View
-- =========================================================
-- Create a summarized financial report view for the accounting team.

CREATE VIEW v_project_financial_summary AS
SELECT
    p.project_name,
    c.client_name,
    p.project_budget,
    COALESCE(SUM(pm.total_cost), 0) AS total_materials_cost,
    (p.project_budget - COALESCE(SUM(pm.total_cost), 0)) AS remaining_budget
FROM projects p
JOIN clients c ON p.client_id = c.client_id
LEFT JOIN project_materials pm ON p.project_id = pm.project_id
GROUP BY p.project_name, c.client_name, p.project_budget;

-- Example usage for accounting:
SELECT * 
FROM v_project_financial_summary
ORDER BY remaining_budget DESC;
