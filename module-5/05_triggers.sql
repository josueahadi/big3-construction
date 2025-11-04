-- =========================================================
-- MODULE 5: TRIGGERS (The "Automatic Rule-Enforcer")
-- Client Request:
-- "Maintain an audit trail and enforce worker safety rules."
-- =========================================================


-- =========================================================
-- PART 5A: Guided Activity - AFTER UPDATE Audit Trigger
-- =========================================================

-- Create an audit log table to track budget increases
CREATE TABLE project_budget_audit (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(10),
    old_budget DECIMAL(12, 2),
    new_budget DECIMAL(12, 2),
    change_user VARCHAR(100),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger that logs every time a project's budget is increased
DELIMITER $$

CREATE TRIGGER trg_audit_project_budget_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    -- Only log if the budget has increased
    IF NEW.budget > OLD.budget THEN
        INSERT INTO project_budget_audit (project_id, old_budget, new_budget, change_user)
        VALUES (OLD.project_id, OLD.budget, NEW.budget, USER());
    END IF;
END$$

DELIMITER ;

-- Test the trigger
UPDATE projects SET budget = budget + 50000 WHERE project_id = 'P001';
-- Verify the log
SELECT * FROM project_budget_audit;



-- =========================================================
-- PART 5B: Challenge Task - BEFORE INSERT Validation Trigger
-- =========================================================

-- This trigger prevents workers with expired or missing "Basic Safety"
-- certification from being assigned to a project.

DELIMITER $$

CREATE TRIGGER trg_check_safety_cert_before_assignment
BEFORE INSERT ON project_assignments
FOR EACH ROW
BEGIN
    DECLARE v_expiry_date DATE;

    -- Retrieve the expiry date for the worker's "Basic Safety" certification
    SELECT c.expiry_date
    INTO v_expiry_date
    FROM certifications c
    WHERE c.worker_id = NEW.worker_id
      AND c.cert_name = 'Basic Safety'
    LIMIT 1;

    -- If no certification or expired, stop the insert
    IF v_expiry_date IS NULL OR v_expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Worker safety certification is expired or missing.';
    END IF;
END$$

DELIMITER ;

-- Test the trigger
-- 1. Set a worker’s Basic Safety cert to an expired date:
-- UPDATE certifications SET expiry_date = '2023-01-01' WHERE worker_id = 5 AND cert_name = 'Basic Safety';
-- 2. Try to assign that worker to a project:
-- INSERT INTO project_assignments (worker_id, project_id, assignment_date)
-- VALUES (5, 2, CURDATE());
-- Expected: ERROR 1644 (45000): Error: Worker safety certification is expired or missing.

-- 3. Renew the certification and try again:
-- UPDATE certifications SET expiry_date = '2026-12-31' WHERE worker_id = 5 AND cert_name = 'Basic Safety';
-- INSERT INTO project_assignments (worker_id, project_id, assignment_date)
-- VALUES (5, 2, CURDATE());
-- Expected: Successful insert.
