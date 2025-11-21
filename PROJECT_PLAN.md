# Big3 Construction Management Dashboard - Backend Project Plan

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Project Structure](#project-structure)
4. [Implementation Phases](#implementation-phases)
5. [Best Practices & Design Patterns](#best-practices--design-patterns)
6. [Technology Stack Justification](#technology-stack-justification)
7. [Database Changes](#database-changes)
8. [API Design](#api-design)
9. [Testing Strategy](#testing-strategy)

---

## Project Overview

### Core Features
1. User Management & RBAC (Admin, PM, Site Supervisor)
2. RESTful API for all entities (Projects, Workers, Clients, Materials, Suppliers)
3. Geospatial search for nearby projects
4. Multilingual support (i18n)
5. Notification system with message queuing
6. Comprehensive unit testing

### Success Criteria
- Secure authentication & authorization
- Role-based access control working correctly
- All CRUD operations functional
- Geospatial queries returning accurate results
- Queue-based notification system operational
- 80%+ test coverage

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│            (Future Frontend - Not in scope)                 │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth         │  │ RBAC         │  │ i18n         │       │
│  │ Middleware   │  │ Middleware   │  │ Middleware   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Projects │ │ Workers  │ │ Clients  │ │ Materials│        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ Business Logic │  │ Validation     │  │ Geospatial   │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER (DAO)                   │
│  Database abstraction - All SQL queries here                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│              MySQL (big3_construction)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  BACKGROUND SERVICES                        │
│  ┌────────────────────┐    ┌──────────────────────┐         │
│  │ Cert Checker       │───▶│ Message Queue        │         │
│  │ (Producer)         │    │ (RabbitMQ/Redis)     │         │
│  └────────────────────┘    └──────────────────────┘         │
│                                      │                      │
│                                      ▼                      │
│                         ┌──────────────────────┐            │
│                         │ Notification Service │            │
│                         │ (Consumer)           │            │
│                         └──────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
big3-construction-backend/
│
├── src/
│   ├── config/
│   │   ├── database.js           # MySQL connection pool
│   │   ├── passport.js           # Passport JWT strategy
│   │   ├── i18n.js               # i18next configuration
│   │   ├── queue.js              # RabbitMQ/Redis setup
│   │   └── env.js                # Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT validation
│   │   ├── rbac.middleware.js    # Role-based access control
│   │   ├── validator.middleware.js  # Request validation
│   │   ├── error.middleware.js   # Global error handler
│   │   └── i18n.middleware.js    # Language detection
│   │
│   ├── models/
│   │   ├── user.model.js         # User entity
│   │   ├── project.model.js      # Project entity
│   │   ├── worker.model.js       # Worker entity
│   │   └── ...                   # Other models
│   │
│   ├── repositories/
│   │   ├── user.repository.js    # User database operations
│   │   ├── project.repository.js # Project database operations
│   │   ├── worker.repository.js  # Worker database operations
│   │   └── ...                   # Other repositories
│   │
│   ├── services/
│   │   ├── auth.service.js       # Authentication logic
│   │   ├── user.service.js       # User business logic
│   │   ├── project.service.js    # Project business logic
│   │   ├── geospatial.service.js # Geo search logic
│   │   ├── notification.service.js # Notification logic
│   │   └── ...                   # Other services
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth endpoints
│   │   ├── user.controller.js    # User CRUD endpoints
│   │   ├── project.controller.js # Project CRUD endpoints
│   │   ├── worker.controller.js  # Worker CRUD endpoints
│   │   └── ...                   # Other controllers
│   │
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth/*
│   │   ├── user.routes.js        # /api/users/*
│   │   ├── project.routes.js     # /api/projects/*
│   │   ├── worker.routes.js      # /api/workers/*
│   │   └── index.js              # Route aggregator
│   │
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── response.helper.js    # Standardized API responses
│   │   ├── haversine.js          # Geospatial calculations
│   │   └── validators.js         # Custom validators
│   │
│   ├── jobs/
│   │   ├── cert-checker.job.js   # Daily cert expiry checker (Producer)
│   │   └── notification-consumer.job.js # Notification consumer
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   └── translation.json  # English translations
│   │   └── es/
│   │       └── translation.json  # Spanish translations
│   │
│   ├── app.js                    # Express app setup
│   └── server.js                 # Server entry point
│
├── tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── user.test.js
│   │   ├── project.test.js
│   │   ├── rbac.test.js
│   │   └── geospatial.test.js
│   ├── integration/
│   │   ├── api.test.js
│   │   └── queue.test.js
│   ├── fixtures/
│   │   └── test-data.js          # Test data
│   └── setup.js                  # Test environment setup
│
├── migrations/
│   └── 07_migrations.sql         # Database schema updates
│
├── scripts/
│   ├── seed-users.js             # Seed initial users
│   └── backfill-coordinates.js   # Backfill lat/lng for projects
│
├── docs/
│   ├── API.md                    # API documentation
│   ├── ARCHITECTURE.md           # Architecture decisions
│   └── DEPLOYMENT.md             # Deployment guide
│
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── jest.config.js                # Jest configuration
├── eslint.config.js              # ESLint rules
├── README.md                     # Main documentation
└── docker-compose.yml            # For RabbitMQ/Redis (optional)
```

---

## Implementation Phases

### Phase 1
**Goal:** Set up project structure and database

**Tasks:**
1. Initialize Node.js project
2. Install dependencies
3. Create project folder structure
4. Write database migration script (07_migrations.sql)
5. Set up MySQL connection pool
6. Configure environment variables
7. Set up logging (Winston)

**Deliverables:**
- Working project structure
- Database updated with users table and lat/lng columns
- Connection to MySQL verified

---

### Phase 2: Authentication & RBAC
**Goal:** Secure the application

**Tasks:**
1. Implement user registration (bcrypt password hashing)
2. Implement user login (JWT generation)
3. Create auth middleware (JWT validation)
4. Create RBAC middleware (role checking)
5. Write tests for auth flow

**Deliverables:**
- POST /api/auth/register
- POST /api/auth/login
- Auth middleware protecting routes
- RBAC middleware enforcing permissions

---

### Phase 3: Core API - CRUD Operations
**Goal:** Build all CRUD endpoints

**Tasks:**
1. Projects API (Full CRUD)
2. Workers API (Full CRUD)
3. Clients API (Full CRUD)
4. Materials API (Full CRUD)
5. Suppliers API (Full CRUD)
6. Apply RBAC to all endpoints
7. Write tests for CRUD operations

**Deliverables:**
- All CRUD endpoints functional
- RBAC properly enforced
- Tests passing

---

### Phase 4: Geospatial Feature
**Goal:** Implement location-based search

**Tasks:**
1. Write script to backfill coordinates for existing projects
2. Implement Haversine formula for distance calculation
3. Create GET /api/projects/nearme endpoint
4. Write tests for geospatial queries

**Deliverables:**
- Geospatial endpoint working
- Accurate distance calculations
- Tests passing

---

### Phase 5: Multilingual Support
**Goal:** Add i18n support

**Tasks:**
1. Set up i18next
2. Create translation files (en, es)
3. Implement language detection middleware
4. Translate all API messages
5. Write tests for i18n

**Deliverables:**
- API responses in multiple languages
- Language preference from user profile working
- Accept-Language header support

---

### Phase 6: Notification System (Days 10-11)
**Goal:** Implement queue-based notifications

**Tasks:**
1. Set up RabbitMQ
2. Create cert-checker job (producer)
3. Create notification consumer
4. Schedule daily cert checks
5. Write tests for queue system

**Deliverables:**
- Daily cert expiry checker running
- Notifications logged to console
- Queue working correctly

---

### Phase 7: Testing & Documentation
**Goal:** Complete test coverage and documentation

**Tasks:**
1. Write all unit tests
2. Write integration tests
3. Achieve 80%+ code coverage
4. Write API documentation
5. Write setup guide (README.md)
6. Write architecture documentation

**Deliverables:**
- Complete test suite
- API documentation
- Setup instructions
- Technical justifications

---

## Best Practices & Design Patterns

### 1. Layered Architecture (MVC + Services)
**Why:** Separation of concerns, easier testing, maintainable code

- **Controllers:** Handle HTTP requests/responses only
- **Services:** Business logic, orchestration
- **Repositories:** Database operations (Data Access Layer)
- **Models:** Data structures and validation

### 2. Repository Pattern
**Why:** Abstract database operations, easier to swap DB or mock for tests

```javascript
// Instead of SQL in controllers:
const project = await db.query('SELECT * FROM projects WHERE id = ?', [id]);

// Use repository:
const project = await projectRepository.findById(id);
```

### 3. Dependency Injection
**Why:** Easier testing, loose coupling

```javascript
// Inject dependencies rather than hard-coding
class ProjectService {
  constructor(projectRepository, notificationService) {
    this.projectRepository = projectRepository;
    this.notificationService = notificationService;
  }
}
```

### 4. Error Handling Strategy
**Why:** Consistent error responses, easier debugging

```javascript
// Custom error classes
class NotFoundError extends Error {}
class UnauthorizedError extends Error {}

// Global error middleware
app.use((err, req, res, next) => {
  const message = req.t(err.message); // i18n
  res.status(err.statusCode || 500).json({ error: message });
});
```

### 5. Validation Layer
**Why:** Security, data integrity

```javascript
// Use Joi or express-validator
const { body, validationResult } = require('express-validator');

router.post('/projects',
  body('project_name').notEmpty(),
  body('budget').isNumeric(),
  validationMiddleware,
  projectController.create
);
```

### 6. Environment-Based Configuration
**Why:** Security, deployment flexibility

```javascript
// .env
DB_HOST=localhost
DB_USER=root
JWT_SECRET=your_secret_here
NODE_ENV=development

// config/env.js
module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  }
};
```

### 7. Logging Strategy
**Why:** Debugging, monitoring, audit trail

```javascript
// Use Winston
logger.info('User login', { userId: user.id, email: user.email });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### 8. API Versioning
**Why:** Backward compatibility

```javascript
// Route structure
/api/v1/projects
/api/v1/workers
```

### 9. Response Standardization
**Why:** Consistent API contract

```javascript
// Success response
{
  "success": true,
  "data": {...},
  "message": "Project created successfully"
}

// Error response
{
  "success": false,
  "error": "Validation failed",
  "details": [...]
}
```

### 10. Security Best Practices
- Use helmet.js for HTTP headers
- Rate limiting (express-rate-limit)
- Input sanitization
- SQL injection prevention (parameterized queries)
- CORS configuration
- Password hashing (bcrypt with salt rounds >= 10)
- JWT with expiration
- Environment variables for secrets

---

## Passport.js + JWT Implementation Guide

### Setup: config/passport.js
```javascript
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userRepository = require('../repositories/user.repository');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // jwt_payload contains: { id, email, role, iat, exp }
        const user = await userRepository.findById(jwt_payload.id);

        if (user) {
          return done(null, user); // Attaches user to req.user
        }
        return done(null, false); // No user found
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
```

### Login: auth.controller.js
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: req.t('auth.invalid_credentials')
      });
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: req.t('auth.invalid_credentials')
      });
    }

    // 3. Create JWT
    const payload = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      language: user.preferred_language
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Return token
    res.json({
      success: true,
      token: token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Register: auth.controller.js
```javascript
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, worker_id } = req.body;

    // 1. Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: req.t('auth.user_exists')
      });
    }

    // 2. Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Create user
    const newUser = await userRepository.create({
      email,
      password_hash,
      role,
      worker_id,
      preferred_language: 'en'
    });

    // 4. Generate token
    const token = jwt.sign(
      { id: newUser.user_id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser.user_id, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    next(error);
  }
};
```

### Protected Routes: project.routes.js
```javascript
const express = require('express');
const router = express.Router();
const passport = require('passport');
const projectController = require('../controllers/project.controller');
const rbacMiddleware = require('../middleware/rbac.middleware');

// Public route (no auth needed)
router.get('/public', projectController.getPublicProjects);

// Protected route (any authenticated user)
router.get('/',
  passport.authenticate('jwt', { session: false }),
  projectController.getAll
);

// Admin-only route
router.post('/',
  passport.authenticate('jwt', { session: false }),
  rbacMiddleware(['Admin']),
  projectController.create
);

// Admin or PM (for their projects) route
router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  rbacMiddleware(['Admin', 'PM']),
  projectController.update
);

module.exports = router;
```

### RBAC Middleware: middleware/rbac.middleware.js
```javascript
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    // req.user is populated by Passport
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: req.t('auth.not_authenticated')
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: req.t('auth.insufficient_permissions')
      });
    }

    next();
  };
};
```

### App Setup: app.js
```javascript
const express = require('express');
const passport = require('passport');
const app = express();

// Initialize Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/project.routes'));

module.exports = app;
```

---

## Technology Stack Justification

### Node.js + Express.js
**Why:**
- Non-blocking I/O perfect for API servers
- Large ecosystem (npm)
- Team familiarity
- Great for CRUD operations
- Easy to test

### MySQL (Existing)
**Why:**
- Already built in Formative 1
- ACID compliance
- Good for relational data
- Supports geospatial queries

### Passport.js + JWT (Authentication Stack)

**Our Choice:** Passport.js with JWT Strategy

**Why Passport.js:**
- **Requirement:** Explicitly mentioned in project specs
- **Standardized patterns:** Industry-standard authentication middleware
- **Extensibility:** Easy to add OAuth, sessions, or other strategies later
- **Less boilerplate:** Handles serialization/deserialization automatically
- **Better testing:** Well-documented mocking patterns
- **Team familiarity**

**Why JWT as the Strategy:**
- **Stateless:** No server-side session storage needed
- **Scalable:** Works across multiple servers without shared state
- **Flexible:** Can carry user info (id, role, language) in payload
- **Industry standard:** Widely adopted in modern APIs

**How They Work Together:**
```
Passport.js (Middleware Framework)
    ↓
passport-jwt (JWT Strategy Plugin)
    ↓
jsonwebtoken (Token Creation/Signing)
```

**Dependencies:**
```json
{
  "passport": "^0.7.0",           // Auth middleware framework
  "passport-jwt": "^4.0.1",       // JWT strategy for Passport
  "jsonwebtoken": "^9.0.2",       // For creating/signing tokens
  "bcrypt": "^5.1.1"              // Password hashing
}
```

**Flow:**
1. User logs in → Server verifies password with bcrypt
2. Server creates JWT with `jsonwebtoken.sign()`
3. Client includes JWT in `Authorization: Bearer <token>` header
4. Passport extracts & validates JWT using `passport-jwt` strategy
5. Passport loads user from database and attaches to `req.user`
6. RBAC middleware checks `req.user.role` for permissions

**Alternative Considered:** Custom JWT (without Passport)
- More code to maintain
- Doesn't meet assignment requirement
- Less standardized
- Only use for microservices with very specific needs

### bcrypt
**Why:**
- Industry standard for password hashing
- Built-in salting
- Adjustable complexity (salt rounds >= 10)
- Protection against rainbow table attacks

### RabbitMQ vs Redis

**RabbitMQ:**
- True message queue (AMQP protocol)
- Message persistence
- Acknowledgments and retries
- Better for complex workflows
- Con: Requires separate service

**Redis:**
- Simpler to set up
- Can also use for caching
- Pub/Sub pattern
- Con: Less robust for guaranteed delivery

**Our Choice:** RabbitMQ
- Better for production notification systems
- More reliable message delivery
- Shows understanding of enterprise patterns

**Justification:**
"We chose RabbitMQ over Redis because our notification system requires guaranteed message delivery and persistence. While Redis is excellent for caching and simple pub/sub, RabbitMQ provides message acknowledgments, automatic retries, and durability guarantees essential for critical notifications about expiring certifications."

### i18next
**Why:**
- Industry standard for i18n
- Supports multiple frameworks
- Easy to add new languages
- Namespace support for organization

### Jest
**Why:**
- Zero configuration
- Fast (parallel tests)
- Built-in mocking
- Coverage reports
- Snapshot testing

---

## Database Changes

### Migration Script: `07_migrations.sql`

```sql
-- 1. Create users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'PM', 'Site Supervisor') NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    worker_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

-- 2. Add geospatial columns to projects
ALTER TABLE projects
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL;

-- 3. Add index for geospatial queries
CREATE INDEX idx_projects_coordinates ON projects(latitude, longitude);

-- 4. Backfill sample coordinates (Ghana cities)
UPDATE projects SET latitude = 5.6037, longitude = -0.1870 WHERE site_city = 'Accra';
UPDATE projects SET latitude = 6.6885, longitude = -1.6244 WHERE site_city = 'Kumasi';
UPDATE projects SET latitude = 4.8845, longitude = -1.7554 WHERE site_city = 'Takoradi';
UPDATE projects SET latitude = 9.4034, longitude = -0.8424 WHERE site_city = 'Tamale';
```

---

## API Design

### API Endpoints Structure

#### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login and get JWT
GET    /api/auth/me             # Get current user info
```

#### Users
```
GET    /api/users               # List all users (Admin only)
GET    /api/users/:id           # Get user by ID
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user (Admin only)
```

#### Projects
```
GET    /api/projects            # List all projects (filtered by role)
GET    /api/projects/:id        # Get project details
POST   /api/projects            # Create project (Admin only)
PUT    /api/projects/:id        # Update project (Admin or assigned PM)
DELETE /api/projects/:id        # Delete project (Admin only)
GET    /api/projects/nearme     # Geospatial search
```

#### Workers
```
GET    /api/workers             # List all workers
GET    /api/workers/:id         # Get worker details
POST   /api/workers             # Create worker (Admin only)
PUT    /api/workers/:id         # Update worker (Admin only)
DELETE /api/workers/:id         # Delete worker (Admin only)
```

#### Clients
```
GET    /api/clients             # List all clients
GET    /api/clients/:id         # Get client details
POST   /api/clients             # Create client (Admin only)
PUT    /api/clients/:id         # Update client (Admin only)
DELETE /api/clients/:id         # Delete client (Admin only)
```

#### Materials
```
GET    /api/materials           # List all materials
GET    /api/materials/:id       # Get material details
POST   /api/materials           # Create material (Admin only)
PUT    /api/materials/:id       # Update material (Admin only)
DELETE /api/materials/:id       # Delete material (Admin only)
```

#### Suppliers
```
GET    /api/suppliers           # List all suppliers
GET    /api/suppliers/:id       # Get supplier details
POST   /api/suppliers           # Create supplier (Admin only)
PUT    /api/suppliers/:id       # Update supplier (Admin only)
DELETE /api/suppliers/:id       # Delete supplier (Admin only)
```

### RBAC Matrix

| Endpoint | Admin | PM | Site Supervisor |
|----------|-------|----|--------------------|
| GET /api/projects | All projects | All projects | Assigned only |
| POST /api/projects | ✅ | ❌ | ❌ |
| PUT /api/projects/:id | ✅ | Assigned only | ❌ |
| DELETE /api/projects/:id | ✅ | ❌ | ❌ |
| GET /api/workers | ✅ | ✅ | Assigned projects only |
| POST /api/workers | ✅ | ❌ | ❌ |
| Assign worker to project | ✅ | Assigned project only | ❌ |

---

## Testing Strategy

### Test Pyramid

```
         /\
        /  \       E2E Tests (Few)
       /────\      - Full workflow tests
      /      \
     /────────\    Integration Tests (Some)
    /          \   - API endpoint tests
   /────────────\  - Database integration
  /              \
 /────────────────\ Unit Tests (Many)
/                  \ - Services, utilities
────────────────────  - Business logic
```

### Test Coverage Goals
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All API endpoints
- **Key Scenarios:**
  - Authentication flow
  - RBAC enforcement
  - CRUD operations
  - Geospatial queries
  - Queue operations

### Sample Tests

```javascript
// Auth test
describe('POST /api/auth/register', () => {
  it('should create a new user with hashed password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123', role: 'PM' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});

// RBAC test
describe('DELETE /api/projects/:id', () => {
  it('should deny access for Site Supervisor', async () => {
    const token = getSiteSupervisorToken();
    const res = await request(app)
      .delete('/api/projects/P001')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// Geospatial test
describe('GET /api/projects/nearme', () => {
  it('should return projects within 50km radius', async () => {
    const res = await request(app)
      .get('/api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
```

---

## Next Steps

1. Review this plan with the team
2. Set up the initial project structure
3. Begin Phase 1 implementation
4. Schedule daily standups to track progress

---

## Questions to Resolve

1. **Queue Choice:** Final decision on RabbitMQ vs Redis?
2. **Deployment:** Where will this be deployed? (Affects Docker setup)
3. **Additional Languages:** Just EN/ES or more?
4. **API Documentation:** Swagger or Markdown?
5. **Geocoding:** Manual lat/lng or use geocoding service?

---

**Created:** 2025-11-20
**Team:** Group 3
**Status:** Planning Phase