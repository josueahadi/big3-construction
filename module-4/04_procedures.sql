-- =========================================================
-- MODULE 4: STORED PROCEDURES (The "One-Click" Tasks)
-- Client Request:
-- "Automate common HR and project management operations."
-- =========================================================

-- =========================================================
-- PART 4A: Guided Activity - Add a New Worker with Skill
-- =========================================================
-- This stored procedure inserts a new worker and their
-- primary skill in one automated step.

DELIMITER $$

CREATE PROCEDURE sp_add_worker_with_skill(
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_salary DECIMAL(10, 2),
    IN p_skill_name VARCHAR(100)
)
BEGIN
    -- Declare variables
    DECLARE v_worker_id INT;
    DECLARE v_skill_id INT;

    -- Start a transaction
    START TRANSACTION;

    -- Insert new worker
    INSERT INTO workers(first_name, last_name, phone, salary)
    VALUES (p_first_name, p_last_name, p_phone, p_salary);

    -- Get the new worker's ID
    SET v_worker_id = LAST_INSERT_ID();

    -- Find the skill's ID
    SELECT skill_id INTO v_skill_id 
    FROM skills 
    WHERE skill_name = p_skill_name;

    -- Add the skill if it exists
    IF v_skill_id IS NOT NULL THEN
        INSERT INTO worker_skills(worker_id, skill_id)
        VALUES (v_worker_id, v_skill_id);
    END IF;

    -- Commit the transaction
    COMMIT;
END$$

DELIMITER ;

-- Test Procedure
CALL sp_add_worker_with_skill('Alice', 'Smith', '555-1234', 75000.00, 'Project Management');
-- Verify the addition:
-- SELECT * FROM workers WHERE first_name = 'Alice';
-- SELECT * FROM worker_skills WHERE worker_id = (SELECT worker_id FROM workers WHERE first_name = 'Alice');


-- =========================================================
-- PART 4B: Challenge Task - Assign Worker to Project with Logic
-- =========================================================
-- This procedure assigns a worker to a project while
-- checking for duplicates and providing user feedback.

DELIMITER $$

CREATE PROCEDURE sp_assign_worker_to_project(
    IN p_worker_id INT,
    IN p_project_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Check if this assignment already exists
    SELECT COUNT(*) INTO v_exists
    FROM project_assignments
    WHERE worker_id = p_worker_id AND project_id = p_project_id;

    -- Conditional logic for duplicate prevention
    IF v_exists > 0 THEN
        SET p_message = 'Error: Worker already assigned to this project.';
    ELSE
        INSERT INTO project_assignments(worker_id, project_id, assignment_date)
        VALUES (p_worker_id, p_project_id, CURDATE());
        SET p_message = 'Success: Worker assigned.';
    END IF;
END$$

DELIMITER ;

-- Test Procedure
SET @message = '';
CALL sp_assign_worker_to_project(2, 3, @message);
SELECT @message;
