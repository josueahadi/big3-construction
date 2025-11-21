# Big3 Construction Management Dashboard - Backend API

Full-stack backend application for Big3 Construction Company, built with Node.js, Express, MySQL, and RabbitMQ.

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
- RabbitMQ message queue
- Automated certification expiry alerts
- Producer/Consumer pattern

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
- **Message Queue:** RabbitMQ 3.x

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
- **RabbitMQ** >= 3.12 (or Docker)
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

### 4. Set Up RabbitMQ

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

**Option B: Install Locally**
- macOS: `brew install rabbitmq`
- Ubuntu: `sudo apt-get install rabbitmq-server`
- Windows: Download from [rabbitmq.com](https://www.rabbitmq.com/download.html)

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

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
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

The API will be available at: `http://localhost:5000`

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
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

---

## Project Structure

```
backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # MySQL connection pool
│   │   ├── passport.js     # Passport JWT strategy
│   │   ├── i18n.js         # i18next setup
│   │   └── queue.js        # RabbitMQ connection
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

### Why RabbitMQ over Redis?
- **Reliability:** Message persistence and acknowledgments
- **Guaranteed Delivery:** Critical for certification alerts
- **Enterprise Pattern:** Shows production-ready architecture
- **Durability:** Messages survive server restarts

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

### Issue: RabbitMQ Connection Failed
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Or check service
sudo systemctl status rabbitmq-server
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
