/**********************************************************************
 * MODULE 6: EVENTS (Scheduled Maintenance)
 * Client Request:
 * Automatically archive projects completed over 5 years ago
 * to keep active reports clean.
 **********************************************************************/

-- ================================================================
-- PART 6A: ENABLE THE EVENT SCHEDULER
-- ================================================================

-- Check if the Event Scheduler is enabled
SHOW VARIABLES LIKE 'event_scheduler';

-- Enable the Event Scheduler if it is OFF
SET GLOBAL event_scheduler = ON;

-- ================================================================
-- PART 6B: CHALLENGE TASK – CREATING THE ARCHIVAL EVENT
-- ================================================================

-- STEP 1: Create the Archive Table
-- Create a table with the same structure as 'projects' to store old records
CREATE TABLE IF NOT EXISTS archived_projects LIKE projects;

-- STEP 2: Create the Monthly Archival Event
-- This event will run once every month and move projects completed
-- over 5 years ago to the archive table, then delete them from 'projects'.

DELIMITER $$

CREATE EVENT IF NOT EXISTS ev_archive_old_projects
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_TIMESTAMP + INTERVAL 1 MONTH
DO
BEGIN
    START TRANSACTION;

    -- Insert old completed projects into the archived_projects table
    INSERT INTO archived_projects
    SELECT *
    FROM projects
    WHERE end_date IS NOT NULL
      AND end_date < (CURDATE() - INTERVAL 5 YEAR);

    -- Delete those same projects from the main projects table
    DELETE FROM projects
    WHERE end_date IS NOT NULL
      AND end_date < (CURDATE() - INTERVAL 5 YEAR);

    COMMIT;
END$$

DELIMITER ;

-- ================================================================
-- OPTIONAL: TESTING COMMANDS (RUN MANUALLY)
-- ================================================================
-- To verify the event is created:
-- SHOW EVENTS;

-- To test without waiting a month:
-- ALTER EVENT ev_archive_old_projects ON SCHEDULE EVERY 1 MINUTE;
-- or
-- ALTER EVENT ev_archive_old_projects ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 10 SECOND;

-- To disable or enable the event manually:
-- ALTER EVENT ev_archive_old_projects DISABLE;
-- ALTER EVENT ev_archive_old_projects ENABLE;

-- To confirm the results after execution:
-- SELECT COUNT(*) FROM projects;
-- SELECT COUNT(*) FROM archived_projects;
