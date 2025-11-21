# Database Setup Instructions
## Big3 Construction - Getting Started

---

## Prerequisites

Before you begin, make sure you have:
- MySQL Server installed and running
- MySQL Workbench installed (or terminal access)
- MySQL credentials (username/password)
- Node.js 18+ and npm (for backend API)

---

## Part 1: Database Setup (Required for Both SQL Modules & Backend API)

### Step 1: Open MySQL Workbench

1. Launch **MySQL Workbench**
2. Click on your **Local instance 3306** connection (or your MySQL connection)
3. Enter your MySQL password when prompted

---

### Step 2: Run Database Migrations IN ORDER

**IMPORTANT:** These migrations must be run in this exact order:

#### Migration 1: Setup Database & Tables (Phase 1)
1. In MySQL Workbench, go to: **File → Open SQL Script**
2. Navigate to: **`migrations/01_setup_database.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ to execute

**Expected Output:** All Phase 1 tables created (clients, projects, workers, etc.)

#### Migration 2: Insert Sample Data (Phase 1)
1. Go to: **File → Open SQL Script**
2. Select: **`migrations/02_insert_data.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ to execute

**Expected Output:** Sample data inserted into all tables

#### Migration 3: Backend Schema (Phase 2)
1. Go to: **File → Open SQL Script**
2. Select: **`migrations/07_migrations.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ to execute

**Expected Output:** `users` table created, lat/lng columns added to projects

#### Migration 4: Seed User Accounts (Phase 2)
1. Go to: **File → Open SQL Script**
2. Select: **`migrations/08_seed_users.sql`**
3. Click **Open**
4. Click the **lightning bolt icon** ⚡ to execute

**Expected Output:** 5 test user accounts created (all passwords are `password123`)

---

### Step 3: Verify Your Database

Run these verification queries:

```sql
-- 1. Make sure you're using the correct database
USE big3_construction;

-- 2. Check all tables exist (should show 12 tables)
SHOW TABLES;

-- 3. Quick data check
SELECT COUNT(*) AS total_clients FROM clients;
SELECT COUNT(*) AS total_projects FROM projects;
SELECT COUNT(*) AS total_workers FROM workers;
SELECT COUNT(*) AS total_users FROM users;

-- 4. Test a simple join to ensure relationships work
SELECT
    p.project_name,
    c.client_name,
    COUNT(pa.worker_id) AS worker_count
FROM projects p
JOIN clients c ON p.client_id = c.client_id
LEFT JOIN project_assignments pa ON p.project_id = pa.project_id
GROUP BY p.project_name, c.client_name;

-- 5. Verify users table
SELECT user_id, email, role FROM users;
```

**Expected Tables:**
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
users                    
user_activity_log 
```

---

### Step 4: Explore Database in the GUI

In MySQL Workbench's left sidebar (Navigator panel):

1. **Refresh the Schemas** (right-click → Refresh All)
2. You should now see **`big3_construction`**
3. Expand it to see:
   - **Tables** (12 tables)
   - **Views** (empty for now - you'll create these in Module 3)
   - **Stored Procedures** (empty - you'll create these in Module 4)

4. **Browse some data:**
   - Expand **Tables**
   - Right-click on `workers` → **Select Rows - Limit 1000**
   - Try the same with `projects`, `clients`, `users`, etc.

---

## Part 2: For SQL Modules (Formative 1)

If you're working on the SQL modules (indexes, views, procedures, etc.):

### Run the modules in order:

1. **Module 1: Indexes** → `module-1/01_indexes.sql`
2. **Module 2: Subqueries** → `module-2/02_subqueries.sql`
3. **Module 3: Views** → `module-3/03_views.sql`
4. **Module 4: Procedures** → `module-4/04_procedures.sql`
5. **Module 5: Triggers** → `module-5/05_triggers.sql`
6. **Module 6: Events** → `module-6/06_events.sql`

**Follow the detailed testing instructions in:** [`TESTING_GUIDE.md`](TESTING_GUIDE.md)

---

## Part 3: For Backend API (Summative)

If you're working on the Node.js backend API:

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings
# Update DB_PASSWORD with your MySQL password
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The server should start on port 5001 (or your configured port).

### Step 5: Test the API

```bash
# Check health endpoint
curl http://localhost:5001/health

# Login (use one of the seeded users)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@big3construction.com","password":"password123"}'
```

**For detailed backend setup, see:** [`backend/README.md`](backend/README.md)

---

## Troubleshooting

### Problem: "Access denied for user"
**Solution:** Make sure you're using the correct MySQL username and password. If you're on a fresh MySQL install, the default user is usually `root`.

### Problem: "Database already exists"
**Solution:** The setup script includes `DROP DATABASE IF EXISTS` to handle this. If you want to preserve an existing database, back it up first.

### Problem: Tables are empty after running insert script
**Solution:** Make sure you ran migrations in order (01 → 02 → 07 → 08). Each migration depends on the previous ones.

### Problem: Foreign key constraint errors
**Solution:** The insert script inserts data in the correct order (parent tables first). Make sure you run the entire script, not individual INSERT statements.

### Problem: "users table doesn't exist" in backend
**Solution:** Make sure you ran migrations 03 and 04 (backend schema and seed users).

### Problem: Backend won't start
**Solution:**
1. Check that MySQL is running
2. Verify your `.env` file has correct database credentials
3. Ensure migrations 01-04 have been run
4. Check logs for specific error messages

---

## Alternative: Command Line Setup

If you prefer using the terminal instead of MySQL Workbench:

```bash
# Navigate to your project directory
cd /path/to/big3-advanced-sql-formative-1-group-3

# Run migrations in order
mysql -u root -p < migrations/01_setup_database.sql
mysql -u root -p big3_construction < migrations/02_insert_data.sql
mysql -u root -p big3_construction < migrations/07_migrations.sql
mysql -u root -p big3_construction < migrations/08_seed_users.sql

# Verify (interactive)
mysql -u root -p big3_construction
```

Then inside the MySQL shell:
```sql
SHOW TABLES;
SELECT COUNT(*) FROM workers;
SELECT COUNT(*) FROM users;
exit
```

---

## Summary of Migration Files

| File | Purpose | When to Run |
|------|---------|-------------|
| `migrations/01_setup_database.sql` | Creates database and Phase 1 tables | Always first |
| `migrations/02_insert_data.sql` | Populates tables with sample data | After 01 |
| `migrations/07_migrations.sql` | Adds users table, lat/lng columns | Before using backend API |
| `migrations/08_seed_users.sql` | Creates test user accounts | Before testing authentication |

---

## Test User Accounts

After running migration 04, you'll have these test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@big3construction.com | password123 | Admin |
| maria.garcia@big3construction.com | password123 | PM |
| lisa.wilson@big3construction.com | password123 | PM |
| john.johnson@big3construction.com | password123 | Site Supervisor |
| michael.brown@big3construction.com | password123 | Site Supervisor |

---

## Next Steps

### For SQL Work:
1. Open [`TESTING_GUIDE.md`](TESTING_GUIDE.md)
2. Start testing Module 1 (Indexes)
3. Work through each module in order

### For Backend API:
1. Open [`backend/README.md`](backend/README.md)
2. Follow the API documentation
3. Test endpoints with curl or Postman

---

**Questions?** Check [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for an overview of how the project is organized.