-- =========================================================
-- MODULE 2: SUBQUERIES & ADVANCED JOINS (The "Complex Questions")
-- Client Request:
-- "We need to know which workers have a specific skill, and which
-- projects have the most workers assigned."
-- =========================================================


-- =========================================================
-- PART 2A: Guided Activity - Subqueries in WHERE and FROM
-- =========================================================

-- Find all workers who have the skill 'Heavy Equipment Operation'
-- Using a subquery in the WHERE clause
SELECT first_name, last_name, phone
FROM workers
WHERE worker_id IN (
    SELECT worker_id
    FROM worker_skills
    WHERE skill_id = (
        SELECT skill_id FROM skills WHERE skill_name = 'Heavy Equipment Operation'
    )
);


-- Using JOINs instead of subqueries (more efficient in larger datasets)
SELECT w.first_name, w.last_name, w.phone
FROM workers w
JOIN worker_skills ws ON w.worker_id = ws.worker_id
JOIN skills s ON ws.skill_id = s.skill_id
WHERE s.skill_name = 'Heavy Equipment Operation';


-- =========================================================
-- PART 2B: Challenge Task - Subquery with Aggregation
-- =========================================================
-- Client Request: "Find the project(s) with the highest number of assigned workers."
-- We'll use a subquery to first count workers per project, then find the max.

SELECT
    p.project_name,
    worker_count
FROM (
    SELECT
        pa.project_id,
        COUNT(pa.worker_id) AS worker_count
    FROM project_assignments pa
    GROUP BY pa.project_id
) AS project_counts
JOIN projects p ON project_counts.project_id = p.project_id
WHERE worker_count = (
    SELECT MAX(worker_count)
    FROM (
        SELECT COUNT(worker_id) AS worker_count
        FROM project_assignments
        GROUP BY project_id
    ) AS counts
);

-- Explanation:
-- 1. The inner subquery counts how many workers each project has.
-- 2. The middle subquery finds the maximum worker count.
-- 3. The outer query retrieves the project(s) with that max count.
