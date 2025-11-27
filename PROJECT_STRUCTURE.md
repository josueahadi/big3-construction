# Project Structure Guide

## Overview

This repository contains the **Big3 Construction Management Dashboard** - a full-stack construction project management system with a Node.js/Express backend API and MySQL database.

---

## Repository Layout

```
big3-advanced-sql-formative-1-group-3/          ← Main repo root
│
├── Database Migrations
│   └── migrations/
│       ├── 01_setup_database.sql               ← Creates database & tables
│       ├── 02_insert_data.sql                  ← Sample data
│       ├── 07_migrations.sql                   ← Backend tables (users, etc.)
│       └── 08_seed_users.sql                   ← User accounts for auth
│
├── Backend API
│   └── backend/                                ← Backend project root
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.js                 ← MySQL connection pool
│       │   │   ├── db.js                       ← Database utilities
│       │   │   ├── passport.js                 ← JWT strategy
│       │   │   ├── i18n.js                     ← i18next config
│       │   │   └── queue.js                    ← Redis queue setup
│       │   ├── middleware/
│       │   │   ├── auth.middleware.js          ← JWT verification
│       │   │   ├── rbac.middleware.js          ← Role-based access
│       │   │   ├── i18n.middleware.js          ← Language detection
│       │   │   └── error.middleware.js         ← Error handler
│       │   ├── models/                         ← (Currently empty)
│       │   ├── repositories/                   ← Database queries
│       │   │   ├── project.repository.js
│       │   │   ├── worker.repository.js
│       │   │   ├── client.repository.js
│       │   │   ├── material.repository.js
│       │   │   ├── supplier.repository.js
│       │   │   └── user.repository.js
│       │   ├── services/                       ← Business logic
│       │   │   ├── auth.service.js
│       │   │   ├── project.service.js
│       │   │   ├── worker.service.js
│       │   │   ├── client.service.js
│       │   │   ├── material.service.js
│       │   │   ├── supplier.service.js
│       │   │   ├── geospatial.service.js       ← Haversine search
│       │   │   └── certification.service.js
│       │   ├── controllers/                    ← Request handlers
│       │   │   ├── auth.controller.js
│       │   │   ├── project.controller.js
│       │   │   ├── worker.controller.js
│       │   │   ├── client.controller.js
│       │   │   ├── material.controller.js
│       │   │   └── supplier.controller.js
│       │   ├── routes/                         ← API routes
│       │   │   ├── auth.routes.js
│       │   │   ├── project.routes.js
│       │   │   ├── worker.routes.js
│       │   │   ├── client.routes.js
│       │   │   ├── material.routes.js
│       │   │   └── supplier.routes.js
│       │   ├── utils/
│       │   │   └── haversine.js                ← Distance calculation
│       │   ├── jobs/                           ← Queue workers
│       │   │   ├── cert-checker.job.js         ← Producer
│       │   │   ├── certExpiryProducer.js
│       │   │   └── notification-consumer.job.js
│       │   ├── queue/
│       │   │   └── certExpiryConsumer.js       ← Redis consumer
│       │   └── locales/                        ← i18n translations
│       │       ├── en/
│       │       │   └── translation.json
│       │       └── es/
│       │           └── translation.json
│       ├── tests/
│       │   ├── unit/                           ← Unit tests
│       │   │   ├── auth.controller.test.js
│       │   │   ├── geospatial.service.test.js
│       │   │   ├── haversine.test.js
│       │   │   ├── i18n.middleware.test.js
│       │   │   ├── rbac.middleware.test.js
│       │   │   ├── queue.test.js
│       │   │   └── worker.repository.test.js
│       │   ├── integration/                    ← API tests
│       │   │   ├── api.endpoints.test.js
│       │   │   ├── geospatial.test.js
│       │   │   ├── i18n.test.js
│       │   │   └── project.crud.test.js
│       │   ├── fixtures/
│       │   │   ├── test-data.js
│       │   │   └── test-helpers.js
│       │   ├── setup.js
│       │   └── README.md
│       ├── docs/
│       │   └── API.md                          ← Full API reference
│       ├── coverage/                           ← Test coverage reports
│       ├── scripts/                            ← Utility scripts
│       ├── package.json
│       ├── .env.example
│       ├── .gitignore
│       ├── TEST_CREDENTIALS.md                 ← Test user accounts
│       └── README.md                           ← Backend documentation
│
└── Documentation
    ├── README.md                               ← Main project README
    ├── PROJECT_PLAN.md                         ← Implementation plan
    ├── PROJECT_STRUCTURE.md                    ← This file
    ├── SETUP_INSTRUCTIONS.md                   ← Setup guide
    └── TESTING_GUIDE.md                        ← Testing guide
```

---

## How to Work With It:

### Database Setup:
```bash
# Work at repository root
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

# Run migrations IN ORDER
mysql -u root -p < migrations/01_setup_database.sql
mysql -u root -p big3_construction < migrations/02_insert_data.sql
mysql -u root -p big3_construction < migrations/07_migrations.sql
mysql -u root -p big3_construction < migrations/08_seed_users.sql
```

### Backend API Development:
```bash
# Work in backend directory
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3/backend

# First time setup
npm install
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm start                # Production mode
npm run dev              # Development mode (with nodemon)

# Run tests
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # With coverage report

# Run notification consumer (separate terminal)
npm run consumer
```

---

## Git Workflow

### .gitignore Files:

**Root `.gitignore`**:
- Ignores general files (`.DS_Store`, IDE files, `node_modules/`)

**Backend `.gitignore`** (`backend/.gitignore`):
- Ignores Node.js specific files (`.env`, `logs/`, `coverage/`)

### Committing Changes:

```bash
# For backend work
git add backend/
git commit -m "feat: implement authentication endpoints"

# For database migrations
git add migrations/
git commit -m "chore: add user table migration"

# For documentation
git add README.md SETUP_INSTRUCTIONS.md
git commit -m "docs: update setup instructions"
```

---

## Common Workflows

### Starting a Development Session:

```bash
# Terminal 1: MySQL (if not running)
mysql.server start
# or
sudo systemctl start mysql

# Terminal 2: Redis (for queue system)
redis-server

# Terminal 3: Backend API
cd backend
npm start

# Terminal 4: Notification Consumer (optional)
cd backend
npm run consumer
```

### Testing Your Work:

```bash
# Run all tests
cd backend
npm test

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only

# Run with coverage
npm run test:coverage

# Test API manually with curl
curl http://localhost:5001/health
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@big3construction.com","password":"password123"}'
```

---

## Key Files Reference

### Documentation:
- **Root README.md** - Main project documentation
- **backend/README.md** - Backend API documentation
- **backend/docs/API.md** - Complete API reference
- **backend/TEST_CREDENTIALS.md** - Test user accounts
- **PROJECT_PLAN.md** - Implementation plan
- **SETUP_INSTRUCTIONS.md** - Setup guide
- **TESTING_GUIDE.md** - Testing guide

### Configuration:
- **backend/.env** - Environment variables (create from .env.example)
- **backend/package.json** - Node.js dependencies and scripts

### Database:
- **migrations/01_setup_database.sql** - Database & table creation
- **migrations/02_insert_data.sql** - Sample data
- **migrations/07_migrations.sql** - Backend tables (users, activity log)
- **migrations/08_seed_users.sql** - Test user accounts

---

## Quick Navigation Commands

```bash
# Go to repo root
cd /Users/habib/Desktop/ALU/advanced-backend/big3-advanced-sql-formative-1-group-3

# Go to backend
cd backend

# Go to migrations
cd migrations

# Back to root from anywhere in repo
cd $(git rev-parse --show-toplevel)

# Open backend in VS Code
code backend/
```

---

## Frequently Asked Questions

- **"Where do I run npm commands?"** → Always in `backend/` directory
- **"Where do I run SQL migrations?"** → From repo root: `mysql -u root -p < migrations/XX_name.sql`
- **"Where are the tests?"** → `backend/tests/`
- **"Where's the database config?"** → `backend/src/config/database.js` and `backend/.env`
- **"Where's package.json?"** → `backend/package.json`
- **"How do I test the API?"** → Use Postman, curl, or run `npm test` in backend/
- **"Where are the API docs?"** → `backend/docs/API.md`
- **"Where are test credentials?"** → `backend/TEST_CREDENTIALS.md`

---

## Architecture Overview

### Layered Architecture
```
Request → Middleware → Controller → Service → Repository → Database
         (Auth/RBAC)   (HTTP)      (Logic)   (Queries)    (MySQL)
```

### Key Technologies
- **Backend Framework:** Express.js
- **Database:** MySQL 8.0 with connection pooling
- **Authentication:** Passport.js with JWT
- **Queue System:** Redis with BLPOP/RPUSH
- **Testing:** Jest + Supertest
- **i18n:** i18next for English/Spanish support

### Design Patterns
- **Repository Pattern** - Database abstraction layer
- **Service Layer Pattern** - Business logic separation
- **Producer/Consumer** - Async notification processing
- **Middleware Chain** - Composable request processing

---

**Summary:** This is a production-ready backend API with comprehensive testing, i18n support, geospatial features, and role-based access control.
