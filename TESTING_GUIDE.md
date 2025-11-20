# MySQL Workbench Testing Guide
## Big3 Construction Phase 2 - Complete Testing Workflow

---

## Part 1: Initial Setup in MySQL Workbench

### Step 1: Open MySQL Workbench
1. Launch MySQL Workbench
2. Click on your local MySQL connection (usually `Local instance 3306`)
3. Enter your MySQL password when prompted

### Step 2: Verify Your Database Exists
```sql
-- Check if big3_construction database exists
SHOW DATABASES;

-- If it exists, select it
USE big3_construction;

-- Verify all tables are present
SHOW TABLES;
```

**Expected Tables:**
- clients
- projects
- workers
- skills
- worker_skills
- certifications
- project_assignments
- suppliers
- materials
- project_materials

### Step 3: Check Sample Data
```sql
-- Quick verification that you have data
SELECT COUNT(*) AS total_clients FROM clients;
SELECT COUNT(*) AS total_projects FROM projects;
SELECT COUNT(*) AS total_workers FROM workers;
```

If any counts are 0, you need to run your Phase 1 data population scripts first.

---

## Part 2: Testing Modules in Order

### MODULE 1: INDEXES

**File:** `module-1/01_indexes.sql`

#### How to Run:
1. In Workbench: **File → Open SQL Script**
2. Navigate to `module-1/01_indexes.sql`
3. Select all (`Cmd+A` / `Ctrl+A`)
4. Click the lightning bolt icon ⚡ (Execute)

#### What to Verify:

**1. Check the EXPLAIN output (before index):**
```sql
EXPLAIN SELECT * FROM workers WHERE last_name = 'Johnson';
```
- Look at the `type` column → should show `ALL` (full table scan)
- Look at `rows` → shows total rows scanned

**2. After creating the index, run EXPLAIN again:**
```sql
EXPLAIN SELECT * FROM workers WHERE last_name = 'Johnson';
```
- `type` should now be `ref` ✅
- `key` should show `idx_worker_lastname` ✅
- `rows` should be much smaller ✅

**3. Verify indexes were created:**
```sql
SHOW INDEX FROM workers;
SHOW INDEX FROM projects;
```
You should see:
- `idx_worker_lastname` on workers
- `idx_projects_city_date` on projects

---

### MODULE 2: SUBQUERIES & ADVANCED JOINS

**File:** `module-2/02_subqueries.sql`

#### How to Run:
1. Open the file in Workbench
2. **Run each query separately** (highlight and execute)
3. Don't run all at once - review results for each query

#### What to Verify:

**1. Workers with specific skill (Subquery version):**
- Should return workers who have 'Heavy Equipment Operation' skill
- If no results, check what skills exist:
```sql
SELECT * FROM skills;
```
- Adjust the skill name in the query to match an actual skill in your database

**2. Workers with specific skill (JOIN version):**
- Should return the same workers as the subquery version
- Compare both result sets to ensure consistency

**3. Project(s) with most workers:**
- Should return project name(s) and worker count
- Verify by manually checking:
```sql
SELECT
    p.project_name,
    COUNT(pa.worker_id) AS worker_count
FROM projects p
JOIN project_assignments pa ON p.project_id = pa.project_id
GROUP BY p.project_name
ORDER BY worker_count DESC;
```

---

### MODULE 3: VIEWS

**File:** `module-3/03_views.sql`

#### How to Run:
1. Open the file in Workbench
2. Execute the entire script

#### What to Verify:

**1. Check views were created:**
```sql
SHOW FULL TABLES WHERE table_type = 'VIEW';
```
You should see:
- `v_project_worker_assignments`
- `v_project_financial_summary`

**2. Test the supervisor view:**
```sql
SELECT * FROM v_project_worker_assignments;
```
- Should show project assignments WITHOUT worker salaries
- Verify no sensitive data is exposed

**3. Test the financial summary view:**
```sql
SELECT * FROM v_project_financial_summary;
```
- Should show: project_name, client_name, project_budget, total_materials_cost, remaining_budget
- Check that math is correct: remaining_budget = project_budget - total_materials_cost

**4. Browse views in GUI:**
- In the left sidebar under `big3_construction`
- Expand the **Views** section
- Right-click each view → **Select Rows** to see data

---

### MODULE 4: STORED PROCEDURES

**File:** `module-4/04_procedures.sql`

#### How to Run:
1. Open the file in Workbench
2. Execute the entire script
3. **Important:** Make sure your SQL Editor preferences allow DELIMITER changes

#### What to Verify:

**1. Check procedures were created:**
```sql
SHOW PROCEDURE STATUS WHERE Db = 'big3_construction';
```
You should see:
- `sp_add_worker_with_skill`
- `sp_assign_worker_to_project`

**2. Test adding a worker with skill:**
```sql
-- Call the procedure
CALL sp_add_worker_with_skill('Alice', 'Smith', '555-1234', 75000.00, 'Project Management');

-- Verify the worker was added
SELECT * FROM workers WHERE first_name = 'Alice' AND last_name = 'Smith';

-- Check their skill was linked
SELECT w.first_name, w.last_name, s.skill_name
FROM workers w
JOIN worker_skills ws ON w.worker_id = ws.worker_id
JOIN skills s ON ws.skill_id = s.skill_id
WHERE w.first_name = 'Alice' AND w.last_name = 'Smith';
```

**3. Test worker assignment (should succeed first time):**
```sql
SET @message = '';
CALL sp_assign_worker_to_project(2, 'P001', @message);
SELECT @message;
```
- Should return: `'Success: Worker assigned.'` ✅

**4. Test duplicate prevention (run same command again):**
```sql
SET @message = '';
CALL sp_assign_worker_to_project(2, 'P001', @message);
SELECT @message;
```
- Should return: `'Error: Worker already assigned to this project.'` ✅

**5. Browse procedures in GUI:**
- Left sidebar → **Stored Procedures**
- Right-click → **Alter Stored Procedure** to view code

---

### 📁 MODULE 5: TRIGGERS

**File:** `module-5/05_triggers.sql`

#### How to Run:
1. Open the file in Workbench
2. Execute the entire script

#### What to Verify:

**1. Check triggers and audit table were created:**
```sql
SHOW TRIGGERS;

-- Should show both triggers:
-- - trg_audit_project_budget_update
-- - trg_check_safety_cert_before_assignment

SHOW TABLES LIKE 'project_budget_audit';
```

**2. Test the budget audit trigger:**
```sql
-- Check current budget
SELECT project_id, budget FROM projects WHERE project_id = 'P001';

-- Increase the budget (trigger should fire)
UPDATE projects SET budget = budget + 50000 WHERE project_id = 'P001';

-- Check the audit log
SELECT * FROM project_budget_audit;
```
- You should see a new row with old_budget, new_budget, and your username

**3. Test the safety certification trigger:**

**Test Case A - Valid certification (should work):**
```sql
-- First, ensure a worker has a valid Basic Safety cert
UPDATE certifications
SET expiry_date = '2026-12-31'
WHERE worker_id = 1 AND cert_name = 'Basic Safety';

-- Try to assign them (should succeed)
INSERT INTO project_assignments (worker_id, project_id, assignment_date)
VALUES (1, 'P002', CURDATE());
```
- Should succeed

**Test Case B - Expired certification (should fail):**
```sql
-- Set a worker's cert to expired
UPDATE certifications
SET expiry_date = '2023-01-01'
WHERE worker_id = 3 AND cert_name = 'Basic Safety';

-- Try to assign them (should fail)
INSERT INTO project_assignments (worker_id, project_id, assignment_date)
VALUES (3, 'P002', CURDATE());
```
- Should show error: `Error: Worker safety certification is expired or missing.`

**4. Browse triggers in GUI:**
- Left sidebar → Expand your table (e.g., `projects`)
- You'll see a **Triggers** section underneath

---

### MODULE 6: EVENTS

**File:** `module-6/06_events.sql`

#### How to Run:
1. Open the file in Workbench
2. Execute the entire script

#### What to Verify:

**1. Check if Event Scheduler is enabled:**
```sql
SHOW VARIABLES LIKE 'event_scheduler';
```
- Should show `ON`
- If OFF, the script should have turned it on

**2. Check the event was created:**
```sql
SHOW EVENTS;
```
- Should show `ev_archive_old_projects`
- Check the schedule is set to `EVERY 1 MONTH`

**3. Verify archive table exists:**
```sql
SHOW TABLES LIKE 'archived_projects';
DESCRIBE archived_projects;
```
- Should have same structure as `projects` table

**4. Test the archival logic manually:**
```sql
-- Create a test project with old end_date
INSERT INTO projects (project_id, project_name, site_address, site_city, start_date, end_date, budget, client_id)
VALUES ('P999', 'Old Test Project', '123 Test St', 'Test City', '2015-01-01', '2018-12-31', 100000, 1);

-- Manually run the archival logic
START TRANSACTION;

INSERT INTO archived_projects
SELECT *
FROM projects
WHERE end_date IS NOT NULL
  AND end_date < (CURDATE() - INTERVAL 5 YEAR);

DELETE FROM projects
WHERE end_date IS NOT NULL
  AND end_date < (CURDATE() - INTERVAL 5 YEAR);

COMMIT;

-- Verify the old project was moved
SELECT * FROM archived_projects WHERE project_id = 'P999';
SELECT * FROM projects WHERE project_id = 'P999'; -- Should be empty
```

**5. Test with accelerated schedule (optional):**
```sql
-- Change event to run every 1 minute for testing
ALTER EVENT ev_archive_old_projects ON SCHEDULE EVERY 1 MINUTE;

-- Wait 1 minute and check
SELECT COUNT(*) FROM archived_projects;

-- Don't forget to change it back!
ALTER EVENT ev_archive_old_projects ON SCHEDULE EVERY 1 MONTH;
```

---

## Part 3: Final Verification Checklist

Run these queries to ensure everything is set up correctly:

```sql
-- Check all indexes
SHOW INDEX FROM workers WHERE Key_name = 'idx_worker_lastname';
SHOW INDEX FROM projects WHERE Key_name = 'idx_projects_city_date';

-- Check all views
SELECT COUNT(*) FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'big3_construction';
-- Should return 2

-- Check all stored procedures
SELECT COUNT(*) FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'big3_construction' AND ROUTINE_TYPE = 'PROCEDURE';
-- Should return 2

-- Check all triggers
SELECT COUNT(*) FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'big3_construction';
-- Should return 2

-- Check all events
SELECT COUNT(*) FROM information_schema.EVENTS
WHERE EVENT_SCHEMA = 'big3_construction';
-- Should return 1

-- Check audit table exists
SHOW TABLES LIKE 'project_budget_audit';

-- Check archive table exists
SHOW TABLES LIKE 'archived_projects';
```

---

## Part 4: Common Issues & Solutions

### Issue 1: "DELIMITER command not recognized"
**Solution:** In Workbench, make sure you're running the stored procedures/triggers in a SQL Editor tab, not the SQL Additions tab.

### Issue 2: "Table doesn't exist" errors
**Solution:** Make sure you ran your Phase 1 setup scripts first:
```sql
-- Run these first if you haven't
source /path/to/01_create_tables.sql;
source /path/to/02_insert_data.sql;
```

### Issue 3: Event Scheduler won't turn ON
**Solution:** You may need administrator privileges:
```sql
-- Try this with root/admin account
SET GLOBAL event_scheduler = ON;
```

### Issue 4: Trigger test fails with "duplicate entry"
**Solution:** The assignment might already exist. Check first:
```sql
SELECT * FROM project_assignments WHERE worker_id = X AND project_id = 'PX';
-- Delete if needed for testing
DELETE FROM project_assignments WHERE worker_id = X AND project_id = 'PX';
```

### Issue 5: No data in views
**Solution:** Make sure you have data in the underlying tables:
```sql
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM project_assignments;
SELECT COUNT(*) FROM workers;
```

---

## Part 5: Screenshot Opportunities

For your documentation/presentation, consider taking screenshots of:

1. **EXPLAIN output** showing index usage (Module 1)
2. **Subquery results** with worker counts (Module 2)
3. **Views in the sidebar** showing they were created (Module 3)
4. **Stored procedures list** from the GUI (Module 4)
5. **Trigger firing** showing error message (Module 5)
6. **Event scheduler** showing the scheduled event (Module 6)
7. **Audit log entries** after budget updates (Module 5)

---

## Quick Reference: MySQL Workbench Shortcuts

- **Execute current statement:** `Cmd+Return` (Mac) / `Ctrl+Enter` (Windows)
- **Execute all:** `Cmd+Shift+Return` / `Ctrl+Shift+Enter`
- **Comment/uncomment:** `Cmd+/` / `Ctrl+/`
- **Format SQL:** `Cmd+B` / `Ctrl+B`
- **Refresh schemas:** Right-click schema → Refresh All

---

**Good luck with your testing!** 🎉

If you encounter any issues, refer back to the module-specific README files in each folder for additional context.
