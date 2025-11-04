-- =========================================================
-- MODULE 1: INDEXES (The "Need for Speed")
-- Client Request: "Our project managers are complaining that the application is slow.
-- Searching for a worker by their last name takes too long, as does finding projects in a specific city."
-- =========================================================


-- =========================================================
-- PART 1A: Guided Activity - Creating a Simple Index
-- =========================================================

-- Step 1: Analyze query performance before indexing
-- This query performs a full table scan (type = ALL)
EXPLAIN SELECT * FROM workers WHERE last_name = 'Johnson';

-- Step 2: Create an index on the workers.last_name column
-- This index will speed up searches by last name
CREATE INDEX idx_worker_lastname ON workers(last_name);

-- Step 3: Verify the performance after indexing
-- After creating the index, the query should now use "ref" type
-- and show "idx_worker_lastname" as the key used
EXPLAIN SELECT * FROM workers WHERE last_name = 'Johnson';



-- =========================================================
-- PART 1B: Challenge Task - Creating a Composite Index
-- =========================================================

-- Client use case:
-- Project managers frequently search for projects by site_city
-- and then sort the results by start_date.
-- Common query pattern:
-- SELECT * FROM projects WHERE site_city = 'Accra' ORDER BY start_date;

-- Step 1: Create a composite index to optimize this pattern
-- Order matters: site_city first (filter condition), start_date second (sort condition)
CREATE INDEX idx_projects_city_date ON projects(site_city, start_date);

-- Step 2: Optional performance check
-- Run EXPLAIN to confirm that MySQL uses the composite index efficiently
EXPLAIN SELECT * FROM projects WHERE site_city = 'Accra' ORDER BY start_date;
