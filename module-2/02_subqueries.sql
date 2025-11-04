-- =========================================================
-- MODULE 2: SUBQUERIES & ADVANCED JOINS
-- Client Request: "We need to answer more complex business questions
-- that require filtering, aggregating, and comparing data across tables."
-- =========================================================


-- =========================================================
-- PART 2A: Guided Activity - Simple Subquery
-- =========================================================
-- Question: Which workers are assigned to projects located in 'Accra'?

-- Step 1: Find all project_ids located in Accra
SELECT project_id
FROM projects
WHERE site_city = 'Accra';

-- Step 2: Use that result in a subquery to find the corresponding workers
SELECT w.worker_id, w.first_name, w.last_name
FROM workers w
WHERE w.worker_id IN (
    SELECT worker_id
    FROM assignments
    WHERE project_id IN (
        SELECT project_id
        FROM projects
        WHERE site_city = 'Accra'
    )
);

-- The above nested subquery approach filters workers
-- based on their assignment to projects in a specific city.


-- =========================================================
-- PART 2B: Guided Activity - Correlated Subquery
-- =========================================================
-- Question: Find workers whose hourly rate is above the company average.

SELECT worker_id, first_name, last_name, hourly_rate
FROM workers w
WHERE hourly_rate > (
    SELECT AVG(hourly_rate)
    FROM workers
);

-- This query dynamically compares each worker’s rate
-- to the average rate of all workers.


-- =========================================================
-- PART 2C: Advanced JOIN Example
-- =========================================================
-- Question: List each project, its site city, and the total number of workers assigned to it.

SELECT 
    p.project_id,
    p.project_name,
    p.site_city,
    COUNT(a.worker_id) AS total_workers
FROM projects p
LEFT JOIN assignments a ON p.project_id = a.project_id
GROUP BY p.project_id, p.project_name, p.site_city
ORDER BY total_workers DESC;

-- This query combines JOIN and aggregation to give insights
-- into workforce distribution across projects.


-- =========================================================
-- PART 2D: Challenge Task - Multi-level Subquery
-- =========================================================
-- Client Request:
-- “We want to reward our top-performing project managers.
-- Show us project managers who manage more projects than the company average.”

-- Step 1: Count the number of projects per manager
-- Step 2: Compare that count to the overall average number of projects managed

SELECT 
    pm.manager_id,
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
    COUNT(p.project_id) AS total_projects
FROM projects p
JOIN managers m ON p.manager_id = m.manager_id
GROUP BY pm.manager_id, manager_name
HAVING COUNT(p.project_id) > (
    SELECT AVG(project_count)
    FROM (
        SELECT manager_id, COUNT(project_id) AS project_count
        FROM projects
        GROUP BY manager_id
    ) AS sub
)
ORDER BY total_projects DESC;

-- This uses a subquery inside a HAVING clause to find managers
-- who manage more projects than the average number of projects managed company-wide.

