# Database Setup Instructions
## Big3 Construction - Getting Started

---

## Prerequisites

Before you begin, make sure you have:
- MySQL Server installed and running
- MySQL Workbench installed
- MySQL credentials (username/password)

---

## Step 1: Open MySQL Workbench

1. Launch **MySQL Workbench**
2. Click on your **Local instance 3306** connection (or your MySQL connection)
3. Enter your MySQL password when prompted

---

## Step 2: Create the Database & Tables

1. In MySQL Workbench, go to: **File → Open SQL Script**
2. Navigate to your project folder and select: **`00_setup_database.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ (or press `Cmd+Shift+Return`) to execute the entire script

### Expected Output:
You should see a message showing all the tables that were created:
```
clients
projects
workers
skills
worker_skills
certifications
project_assignments
suppliers
materials
project_materials
```

And a final message: `Database setup complete!`

---

## Step 3: Insert Sample Data

1. Go to: **File → Open SQL Script**
2. Select: **`00_insert_sample_data.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ to execute

### Expected Output:
You should see a summary table showing the number of rows inserted in each table:
```
Clients: 5
Projects: 5
Workers: 8
Skills: 8
Worker Skills: 16
Certifications: 12
Project Assignments: 17
Suppliers: 5
Materials: 8
Project Materials: 15
```

---

## Step 4: Verify Your Database

Run these verification queries to make sure everything is set up correctly:

```sql
-- 1. Make sure you're using the correct database
USE big3_construction;

-- 2. Check all tables exist
SHOW TABLES;

-- 3. Quick data check
SELECT COUNT(*) AS total_clients FROM clients;
SELECT COUNT(*) AS total_projects FROM projects;
SELECT COUNT(*) AS total_workers FROM workers;

-- 4. Test a simple join to ensure relationships work
SELECT
    p.project_name,
    c.client_name,
    COUNT(pa.worker_id) AS worker_count
FROM projects p
JOIN clients c ON p.client_id = c.client_id
LEFT JOIN project_assignments pa ON p.project_id = pa.project_id
GROUP BY p.project_name, c.client_name;
```

### Expected Result:
You should see a list of projects with their clients and worker counts. Something like:
```
Downtown Plaza      | Acme Corporation       | 4
Highway Bridge      | Global Industries      | 3
Office Complex      | City Development LLC   | 5
Shopping Mall       | Tech Innovations Inc   | 2
Solar Farm          | Green Energy Solutions | 3
```

---

## Step 5: Explore Your Database in the GUI

In MySQL Workbench's left sidebar (Navigator panel):

1. **Refresh the Schemas** (right-click → Refresh All)
2. You should now see **`big3_construction`**
3. Expand it to see:
   - **Tables** (10 tables)
   - **Views** (empty for now - you'll create these in Module 3)
   - **Stored Procedures** (empty - you'll create these in Module 4)
   - **Functions** (empty)

4. **Browse some data:**
   - Expand **Tables**
   - Right-click on `workers` → **Select Rows - Limit 1000**
   - You should see your 8 workers
   - Try the same with `projects`, `clients`, etc.

---

## Step 6: You're Ready for Phase 2!

Now that your database is set up, you can start testing the Phase 2 modules:

### Run the modules in order:

1. **Module 1: Indexes** → `module-1/01_indexes.sql`
2. **Module 2: Subqueries** → `module-2/02_subqueries.sql`
3. **Module 3: Views** → `module-3/03_views.sql`
4. **Module 4: Procedures** → `module-4/04_procedures.sql`
5. **Module 5: Triggers** → `module-5/05_triggers.sql`
6. **Module 6: Events** → `module-6/06_events.sql`

**Follow the detailed testing instructions in:** [`TESTING_GUIDE.md`](TESTING_GUIDE.md)

---

## Troubleshooting

### Problem: "Access denied for user"
**Solution:** Make sure you're using the correct MySQL username and password. If you're on a fresh MySQL install, the default user is usually `root`.

### Problem: "Database already exists"
**Solution:** The setup script includes `DROP DATABASE IF EXISTS` to handle this. If you want to preserve an existing database, back it up first.

### Problem: Tables are empty after running insert script
**Solution:** Make sure you ran `00_setup_database.sql` BEFORE `00_insert_sample_data.sql`. The tables must exist before you can insert data.

### Problem: Foreign key constraint errors
**Solution:** The insert script inserts data in the correct order (parent tables first). Make sure you run the entire script, not individual INSERT statements.

---

## Alternative: Command Line Setup

If you prefer using the terminal instead of MySQL Workbench:

```bash
# Navigate to your project directory
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

# Run the setup script
mysql -u your_username -p < 00_setup_database.sql

# Run the data insert script
mysql -u your_username -p < 00_insert_sample_data.sql

# Verify (interactive)
mysql -u your_username -p big3_construction
```

Then inside the MySQL shell:
```sql
SHOW TABLES;
SELECT COUNT(*) FROM workers;
exit
```

---

## Next Steps

Once your database is set up and verified:

1. Open [`TESTING_GUIDE.md`](TESTING_GUIDE.md)
2. Start testing Module 1 (Indexes)
3. Work through each module in order
