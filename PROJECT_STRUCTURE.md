# Project Structure Guide

## Overview

This repository contains **TWO related projects**:

1. **Formative 1** - Advanced SQL (Modules 1-6)
2. **Summative** - Backend API (Node.js/Express)

---

## Repository Layout

```
big3-advanced-sql-formative-1-group-3/          ← Main repo root
│
├── Formative 1: SQL Work
│   ├── module-1/
│   │   ├── 01_indexes.sql
│   │   └── README.md
│   ├── module-2/
│   │   ├── 02_subqueries.sql
│   │   └── README.md
│   ├── module-3/
│   │   ├── 03_views.sql
│   │   └── README.md
│   ├── module-4/
│   │   ├── 04_procedures.sql
│   │   └── README.md
│   ├── module-5/
│   │   ├── 05_triggers.sql
│   │   └── README.md
│   ├── module-6/
│   │   ├── 06_events.sql
│   │   └── README.md
│   ├── 00_setup_database.sql
│   ├── 00_insert_sample_data.sql
│   ├── SETUP_INSTRUCTIONS.md
│   ├── TESTING_GUIDE.md
│   └── README.md                               ← Main formative 1 docs
│
├── Database Migrations (Shared between formative and summative)
│   ├── migrations/
│   │   ├── 07_migrations.sql                   ← Phase 2 migrations
│   │   └── 08_seed_users.sql                   ← User accounts
│
├── Summative: Backend API
│   └── backend/                                ← Backend project root
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.js
│       │   │   ├── passport.js
│       │   │   ├── i18n.js
│       │   │   └── queue.js
│       │   ├── middleware/
│       │   │   ├── auth.middleware.js
│       │   │   ├── rbac.middleware.js
│       │   │   └── error.middleware.js
│       │   ├── models/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── utils/
│       │   ├── jobs/
│       │   └── locales/
│       │       ├── en/
│       │       └── es/
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/
│       ├── docs/
│       ├── scripts/
│       ├── package.json
│       ├── .env.example
│       ├── .gitignore                          ← Backend-specific
│       └── README.md                           ← Backend-specific docs
│
└── Planning & Documentation
    ├── PROJECT_PLAN.md
    |__ PROJECT_STRUCTURE.md                    ← This file
```

---

## How to Work With It:

#### For SQL Work (Formative 1):
```bash
# Work at repository root
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

# Run SQL files
mysql -u root -p big3_construction < module-1/01_indexes.sql
```

#### For Backend API (Summative):
```bash
# Work in backend directory
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3/backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

#### For Database Migrations:
```bash
# Run from repository root (they're shared)
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

mysql -u root -p big3_construction < migrations/07_migrations.sql
mysql -u root -p big3_construction < migrations/08_seed_users.sql
```

---

## Git Workflow

### .gitignore Files:

**Root `.gitignore`** (already exists):
- Ignores general files (`.DS_Store`, IDE files)

**Backend `.gitignore`** (`backend/.gitignore`):
- Ignores Node.js specific files (`node_modules/`, `.env`, `logs/`)

### Committing Changes:

```bash
# For SQL work (Formative 1)
git add module-1/ module-2/ ...
git commit -m "feat: add indexes and views"

# For backend work (Summative)
git add backend/
git commit -m "feat: implement authentication endpoints"

# For database changes (shared)
git add migrations/
git commit -m "chore: add user table migration"
```

---

## Common Workflows

### Starting a Development Session:

```bash
# Terminal 1: MySQL (if not running)
mysql.server start

# Terminal 2: RabbitMQ (for backend)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Terminal 3: Backend API
cd backend
npm run dev

# Terminal 4: Background jobs (when needed)
cd backend
npm run cert-checker    # or
npm run consumer
```

### Testing Your Work:

```bash
# Test SQL (Formative 1)
cd /path/to/repo
mysql -u root -p big3_construction < module-3/03_views.sql

# Test Backend (Summative)
cd backend
npm test
npm run test:unit
npm run test:integration
```

---

## Key Files Reference

### Documentation:
- **Root README.md** - Formative 1 (SQL) documentation
- **backend/README.md** - Summative (API) documentation
- **PROJECT_PLAN.md** - Complete implementation plan

### Configuration:
- **backend/.env** - Backend environment variables (create from .env.example)
- **backend/package.json** - Node.js dependencies

### Database:
- **00_setup_database.sql** - Phase 1 database setup
- **00_insert_sample_data.sql** - Phase 1 sample data
- **migrations/07_migrations.sql** - Phase 2 database changes
- **migrations/08_seed_users.sql** - User accounts for API

---

## Quick Navigation Commands

```bash
# Go to repo root
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

# Go to backend
cd backend

# Go to specific module
cd module-3

# Go to migrations
cd migrations

# Back to root from anywhere in repo
cd $(git rev-parse --show-toplevel)
```

---

## Questions?

- **"Where do I run npm commands?"** → Always in `backend/` directory
- **"Where do I run SQL files?"** → From repo root, pointing to the file
- **"Where are the tests?"** → `backend/tests/`
- **"Where's the database config?"** → `backend/src/config/database.js`
- **"Where's package.json?"** → `backend/package.json`

---

**Summary:** Root = SQL work, `backend/` = API work, `migrations/` = shared database changes
