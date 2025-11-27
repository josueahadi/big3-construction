# Big3 Construction Management Dashboard - Backend API

Full-stack backend application for Big3 Construction Company, built with Node.js, Express, MySQL, and Redis.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Technical Decisions](#technical-decisions)

---

## Features

**User Management & RBAC**
- Secure authentication with Passport.js + JWT
- Role-based access control (Admin, PM, Site Supervisor)
- Password hashing with bcrypt

**RESTful API**
- Full CRUD operations for all entities
- Projects, Workers, Clients, Materials, Suppliers
- Role-based endpoint protection

**Geospatial Search**
- Find projects within a specified radius
- Haversine formula for distance calculation
- Lat/Lng coordinate support

**Multilingual Support (i18n)**
- English and Spanish translations
- User language preference
- Accept-Language header support

**Notification System**
- Redis-based message queue
- Automated certification expiry alerts
- Producer/Consumer pattern with blocking pop

**Comprehensive Testing**
- Unit and integration tests
- 80%+ code coverage
- Jest testing framework

---

## Tech Stack

### Core
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MySQL 8.x
- **Message Queue:** Redis 7.x

### Authentication & Security
- **passport** - Authentication middleware
- **passport-jwt** - JWT strategy for Passport
- **jsonwebtoken** - JWT token creation
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **cors** - CORS middleware

### Internationalization
- **i18next** - i18n framework
- **i18next-fs-backend** - File system backend
- **i18next-http-middleware** - Express middleware

### Utilities
- **winston** - Logging
- **express-validator** - Request validation
- **dotenv** - Environment configuration
- **node-cron** - Job scheduling

### Testing
- **jest** - Test framework
- **supertest** - HTTP assertions

---

## Prerequisites

### System Requirements

Ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0
- **Redis** >= 7.0 (or Docker)
- **Git**

### Database Prerequisites

**IMPORTANT:** Before running the backend, you must first complete the Phase 1 database setup from the repository root:

1. Run migrations **01** and **02** to create the base database structure and sample data
2. Then run migrations **07** and **08** to add backend-specific tables

See the [root README.md](../README.md#database-setup) for detailed migration instructions.

If you haven't run these migrations yet, the backend will fail to start with database connection errors.

---

## Installation

### 1. Clone the Repository
```bash
cd big3-advanced-sql-formative-1-group-3
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database

**If you haven't already run the Phase 1 migrations:**
```bash
# From the repository root directory
cd ..

# Run all 4 migrations in order
mysql -u root -p < migrations/01_setup_database.sql
mysql -u root -p big3_construction < migrations/02_insert_data.sql
mysql -u root -p big3_construction < migrations/07_migrations.sql
mysql -u root -p big3_construction < migrations/08_seed_users.sql

# Return to backend directory
cd backend
```

**If you've already run migrations 01 and 02:**
```bash
# From the repository root, just run the backend-specific migrations
mysql -u root -p big3_construction < migrations/07_migrations.sql
mysql -u root -p big3_construction < migrations/08_seed_users.sql
```

### 4. Set Up Redis

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Option B: Install Locally**
- macOS: `brew install redis` then `brew services start redis`
- Ubuntu: `sudo apt-get install redis-server`
- Windows: Download from [redis.io](https://redis.io/download) or use WSL

---

## Configuration

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Edit `.env` File
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=big3_construction

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Redis Queue Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
CERT_QUEUE_NAME=cert_notifications
CERT_EXPIRY_WARNING_DAYS=30
CERT_CHECK_CRON=10 0 * * *
```

### 3. Verify Configuration
```bash
npm run test:connection
```

---

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Background Jobs
```bash
# Terminal 1: Start certification checker (producer)
npm run cert-checker

# Terminal 2: Start notification consumer
npm run consumer
```

The API will be available at: `http://localhost:5001`

---

## API Documentation

> **Full API documentation is available at [`docs/API.md`](docs/API.md)**

This section provides a quick overview of the main endpoints. For comprehensive documentation including all endpoints, request/response schemas, and examples, see the complete API reference.

### Testing the API

You can test the API using:
- **curl** (command line examples shown below)
- **Postman** (recommended - see [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) for setup guide)
- **Thunder Client** (VS Code extension)
- **Insomnia** or any HTTP client

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "PM",
  "worker_id": 2
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@big3construction.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@big3construction.com",
    "role": "Admin"
  }
}
```

### Protected Endpoints

All protected endpoints require JWT token in Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

#### Projects
```http
GET    /api/projects           # List all projects
GET    /api/projects/:id       # Get project details
POST   /api/projects           # Create project (Admin only)
PUT    /api/projects/:id       # Update project (Admin/PM)
DELETE /api/projects/:id       # Delete project (Admin only)
GET    /api/projects/nearme    # Geospatial search
```

#### Geospatial Search Example
```http
GET /api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_city": "Accra",
      "distance_km": 2.5
    }
  ]
}
```

#### Workers
```http
GET    /api/workers            # List all workers
GET    /api/workers/:id        # Get worker details
POST   /api/workers            # Create worker (Admin only)
PUT    /api/workers/:id        # Update worker (Admin only)
DELETE /api/workers/:id        # Delete worker (Admin only)
```

#### Clients, Materials, Suppliers
Similar CRUD patterns apply.

### Test Credentials

```
Admin:
Email: admin@big3construction.com
Password: password123

Project Manager:
Email: maria.garcia@big3construction.com
Password: password123

Site Supervisor:
Email: john.johnson@big3construction.com
Password: password123
```

For complete API documentation, see [docs/API.md](docs/API.md)

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm test
# Open coverage/lcov-report/index.html in browser
```

### Testing the Notification System

The certification expiry notification system uses a producer-consumer pattern with Redis. Here's how to test it:

**How it works:**
1. **Producer** (`certExpiryProducer.js`) - Runs on a cron schedule, queries the database for expiring certifications, and enqueues notification messages to Redis
2. **Redis Queue** - Stores messages until consumed
3. **Consumer** (`certExpiryConsumer.js`) - Continuously listens for messages and processes them (currently logs to console, would send emails in production)

**What triggers notifications:**
- Certifications expiring within `CERT_EXPIRY_WARNING_DAYS` (default: 30 days)
- Scheduled by cron expression in `CERT_CHECK_CRON` environment variable
- Can also be triggered manually for testing

#### Prerequisites

**IMPORTANT:** Before testing, ensure your `.env` file has Redis configuration:

```env
# Redis Configuration (Required for notifications)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
CERT_QUEUE_NAME=cert_notifications

# Notification Settings
CERT_EXPIRY_WARNING_DAYS=30
CERT_CHECK_CRON=0 9 * * *  # Daily at 9 AM (or use */5 * * * * * for testing every 5 seconds)
```

If Redis config is missing from your `.env`, copy it from `.env.example` or add it manually.

1. Ensure Redis is running:
   ```bash
   redis-cli ping  # Should return: PONG
   ```

2. Ensure you have test data with certifications:
   ```sql
   SELECT cert_id, cert_name, expiry_date, DATEDIFF(expiry_date, CURDATE()) AS days_left
   FROM certifications
   WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
   ```

3. **(Optional) Clear any existing messages in the queue:**
   ```bash
   redis-cli DEL cert_notifications
   ```

#### Option 1: Manual Testing (Quick Test)

**Step 1: Run producer once to enqueue messages**
```bash
cd backend
node src/jobs/certExpiryProducer.js
```
Expected output: `[Producer] Enqueued cert notification for...`

**Step 2: Check Redis queue**
```bash
redis-cli LLEN cert_notifications
# Should show number of messages in queue
```

**Step 3: Run consumer to process messages**
```bash
node src/queue/certExpiryConsumer.js
```
Expected output: `NOTIFICATION: Sending email to PM...`

Press `Ctrl+C` to stop the consumer.

#### Option 2: Quick Development Testing (Every 5 Seconds)

For rapid testing during development, you can set the cron to run every 5 seconds:

**Step 1: Update `.env` for fast testing**
```env
CERT_CHECK_CRON=*/5 * * * * *  # Runs every 5 seconds
```

**Step 2: Terminal 1 - Start consumer**
```bash
npm run consumer
```
Output: `[Consumer] Starting; waiting for queue messages...`

**Step 3: Terminal 2 - Start producer with fast cron**
```bash
npm run cert-checker
```
Output: `[cert-checker.job.js] Producer started and scheduled`

**Step 4: Watch notifications appear every 5 seconds**

The consumer (Terminal 1) will show notifications like:
```
NOTIFICATION: Sending email to PM Maria Garcia <maria.garcia@big3construction.com>
for worker John Johnson (ID 1) - certification "Basic Safety" expires in 15 days
on 2025-12-12. (cert_id: 1)
```

**Step 5: Stop and reset**
- Press `Ctrl+C` in both terminals
- Clear the queue: `redis-cli DEL cert_notifications`
- Reset `.env` to daily schedule: `CERT_CHECK_CRON=0 9 * * *`

**Note:** The 5-second cron is only for development/testing. Use daily schedule in production to avoid:
- Database overload from constant queries
- Duplicate notifications filling the queue
- Unnecessary Redis memory usage

#### Option 3: Testing with npm scripts (Production Mode)

**Terminal 1 - Start Consumer (runs continuously)**
```bash
npm run consumer
```
Output: `[Consumer] Starting; waiting for queue messages...`

**Terminal 2 - Run Producer**
```bash
npm run cert-checker
```

The producer runs on a cron schedule (configured in `.env`), but you can also trigger it manually.

#### Option 4: Automated Testing

Run the unit test for the consumer:
```bash
npm test -- notification.consumer.test.js
```

#### Verifying the Full Flow

1. **Add test certification expiring soon:**
   ```sql
   UPDATE certifications
   SET expiry_date = DATE_ADD(CURDATE(), INTERVAL 15 DAY)
   WHERE cert_id = 1;
   ```

2. **Run producer:**
   ```bash
   node src/jobs/certExpiryProducer.js
   ```

3. **Check console output** - should see:
   ```
   [Producer] Enqueued cert notification for John Doe (Basic Safety) -> PM: pm@example.com
   ```

4. **Consumer should automatically process** (if running) and log:
   ```
   NOTIFICATION: Sending email to PM Jane Smith <pm@example.com> for worker John Doe...
   ```

#### Configuration Options

Customize notification behavior via `.env`:

```env
# How many days ahead to check for expiring certs
CERT_EXPIRY_WARNING_DAYS=30

# Cron schedule (default: daily at 00:10)
CERT_CHECK_CRON=10 0 * * *

# Redis queue name
CERT_QUEUE_NAME=cert_notifications
```

#### Troubleshooting

**Producer enqueuing but consumer not receiving (messages stuck in queue):**

This is the most common issue. Symptoms:
- Producer logs: `[Producer] Enqueued cert notification for...`
- Consumer logs: `[Consumer] Starting; waiting for queue messages...` but no notifications appear
- Queue has messages: `redis-cli LLEN cert_notifications` shows a number > 0

**Solution:**
1. Verify Redis configuration exists in `.env`:
   ```bash
   grep -E "REDIS_HOST|REDIS_PORT|CERT_QUEUE_NAME" .env
   ```
   If missing, add:
   ```env
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_PASSWORD=
   CERT_QUEUE_NAME=cert_notifications
   ```

2. Restart the consumer after adding Redis config:
   ```bash
   # Stop consumer (Ctrl+C)
   npm run consumer
   ```

3. The consumer should immediately process all queued messages.

**No messages enqueued:**
- Check if certifications exist that expire within the configured timeframe:
  ```sql
  SELECT * FROM certifications
  WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
  ```
- Verify database connection
- Check producer logs for errors
- Ensure `CERT_EXPIRY_WARNING_DAYS` is set correctly in `.env`

**Consumer not receiving messages (Redis connection issue):**
- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check queue has messages: `redis-cli LLEN cert_notifications`
- Verify `REDIS_HOST` and `REDIS_PORT` in `.env` match your Redis server
- Check for Redis errors in consumer logs

**Duplicate notifications:**
- Running the producer multiple times creates duplicate messages in the queue
- This is expected behavior (producer doesn't check for duplicates)
- Clear queue before testing: `redis-cli DEL cert_notifications`
- In production, the cron schedule prevents duplicates

**Messages stuck in queue:**
- Check consumer is running: `ps aux | grep consumer`
- Consumer may have crashed - check logs for errors
- Restart consumer: `npm run consumer`
- Last resort - clear queue: `redis-cli DEL cert_notifications`

**TypeError: rows is not iterable:**
- This error occurred in early versions
- Fixed by importing `pool` correctly: `const { pool } = require('../config/database')`
- If you see this, verify [certExpiryProducer.js:2](src/jobs/certExpiryProducer.js#L2) uses destructuring

---

## Project Structure

```
backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # MySQL connection pool
│   │   ├── passport.js     # Passport JWT strategy
│   │   ├── i18n.js         # i18next setup
│   │   └── queue.js        # Redis queue connection
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── validator.middleware.js
│   │   └── error.middleware.js
│   ├── models/             # Data models
│   ├── repositories/       # Database layer (DAO)
│   ├── services/           # Business logic
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   ├── jobs/               # Background jobs
│   ├── locales/            # Translation files
│   │   ├── en/translation.json
│   │   └── es/translation.json
│   ├── app.js              # Express app
│   └── server.js           # Server entry point
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── .env.example            # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Technical Decisions

### Why Passport.js + JWT?
- **Requirement:** Explicitly specified in project specs
- **Standardization:** Industry-standard authentication
- **Extensibility:** Easy to add OAuth later
- **Stateless:** Scalable across multiple servers

### Why Redis for Queue?
- **Simplicity:** Lightweight, easy to set up and maintain
- **Sufficient for Use Case:** Daily cert checks don't require complex routing
- **Blocking Operations:** BRPOP provides efficient consumer waiting
- **Performance:** Fast in-memory operations for quick job processing
- **Wide Adoption:** Used by popular libraries like Sidekiq and Bull

### Why Repository Pattern?
- **Separation of Concerns:** Business logic separate from data access
- **Testability:** Easy to mock database calls
- **Maintainability:** Database changes isolated to one layer

### Why i18next?
- **Industry Standard:** Most popular Node.js i18n library
- **Flexibility:** Supports multiple backends and frameworks
- **Easy Integration:** Works seamlessly with Express

---

## Common Issues & Solutions

### Issue: Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
DB_USER=root
DB_PASSWORD=your_actual_password
```

### Issue: Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Or check Docker container
docker ps | grep redis

# Or check service (Linux)
sudo systemctl status redis-server
```

### Issue: JWT Authentication Failed
```bash
# Ensure JWT_SECRET is set in .env
# Ensure token is in Authorization header
Authorization: Bearer <token>
```

---

## Development Workflow

1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Run tests and linting
5. Create pull request
6. Code review
7. Merge to main

---

## License

ISC

---

## Team

Group 3 - ALU Advanced Backend Development

---

**Need Help?** Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) or contact the team.
