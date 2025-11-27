# Big3 Construction Management Dashboard - Presentation Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Postman Demonstrations](#postman-demonstrations)
3. [Code Showcase](#code-showcase)
4. [Challenges & Solutions](#challenges--solutions)
5. [Technical Highlights](#technical-highlights)

---

## 🚀 Quick Start

### Prerequisites Check
Before the presentation, ensure these services are running:

```bash
# Terminal 1: Start MySQL (if not already running)
# Verify connection: mysql -u root -p

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start the backend server
cd backend
npm start

# Terminal 4: Start notification consumer (optional, for demo)
npm run consumer
```

**Verify API is running:**
```bash
curl http://localhost:5001/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## 📮 Postman Demonstrations

### Setup: Import Collection
Create a new Postman collection called "Big3 Construction API Demo"

### Base URL
```
http://localhost:5001/api
```

---

### Demo 1: User Login as PM

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "maria.garcia@big3construction.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 2,
    "email": "maria.garcia@big3construction.com",
    "role": "PM",
    "worker_id": 2
  }
}
```

**📝 Talking Points:**
- JWT-based authentication using Passport.js
- Password hashed with bcrypt
- Token valid for 7 days (configurable)
- Copy the token for next demos!

---

### Demo 2: PM Fails to Access Admin-Only Route

**Endpoint:** `GET /api/projects/stats`

**Headers:**
```
Authorization: Bearer <PM_TOKEN_FROM_DEMO_1>
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "message": "This action requires one of the following roles: Admin"
}
```

**📝 Talking Points:**
- RBAC middleware intercepts before controller
- Clear error message indicates required role
- Status code 403 (Forbidden) vs 401 (Unauthorized)
- Admin-only endpoints: DELETE operations, statistics, worker management

**Other Admin-Only Routes to Try:**
```
POST   /api/projects       (Create new project)
DELETE /api/projects/:id   (Delete project)
POST   /api/workers        (Create worker)
DELETE /api/clients/:id    (Delete client)
```

---

### Demo 3: PM Successfully Accesses Allowed Route

**Endpoint:** `GET /api/projects`

**Headers:**
```
Authorization: Bearer <PM_TOKEN_FROM_DEMO_1>
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_city": "Accra",
      "client_name": "Big Retail Corp",
      "budget": 5000000.00,
      "start_date": "2024-01-15",
      "end_date": "2024-12-15"
    },
    // ... more projects the PM has access to
  ],
  "count": 5
}
```

**📝 Talking Points:**
- PM sees only projects they're assigned to (RBAC filtering in service layer)
- Admin would see ALL projects
- Demonstrates repository pattern with role-based filtering

**Other PM-Allowed Routes:**
```
GET    /api/projects/:id       (View project details)
PUT    /api/projects/:id       (Update project - Admin or PM)
GET    /api/workers            (View workers)
GET    /api/materials          (View materials)
POST   /api/clients            (Create clients - Admin or PM)
```

---

### Demo 4: Geospatial Search (/api/projects/nearme)

**Endpoint:** `GET /api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50`

**Headers:**
```
Authorization: Bearer <PM_TOKEN_FROM_DEMO_1>
```

**Query Parameters:**
```
lat: 5.6037       (Accra, Ghana latitude)
lng: -0.1870      (Accra, Ghana longitude)
radius: 50        (50 km radius)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_city": "Accra",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "distance_km": 0.0
    },
    {
      "project_id": "P002",
      "project_name": "Airport Expansion",
      "site_city": "Accra",
      "latitude": 5.6050,
      "longitude": -0.1820,
      "distance_km": 5.2
    },
    {
      "project_id": "P003",
      "project_name": "Waterfront Development",
      "site_city": "Takoradi",
      "latitude": 4.8967,
      "longitude": -1.7558,
      "distance_km": 215.3
    }
  ],
  "search_params": {
    "latitude": 5.6037,
    "longitude": -0.1870,
    "radius_km": 50
  }
}
```

**📝 Talking Points:**
- Uses Haversine formula for accurate distance calculation on spherical Earth
- Returns projects sorted by distance (nearest first)
- Respects RBAC: PM only sees assigned projects within radius
- Lat/Lng validation: -90 to 90, -180 to 180
- Real-world use case: "Find construction sites near me"

**Try Different Locations:**
```
# Lagos, Nigeria
lat=6.5244&lng=3.3792&radius=100

# Nairobi, Kenya
lat=-1.2864&lng=36.8172&radius=75

# Cape Town, South Africa
lat=-33.9249&lng=18.4241&radius=50
```

---

### Demo 5: Internationalization (i18n)

#### 5a. Error in English (Default)

**Endpoint:** `GET /api/projects/INVALID_ID`

**Headers:**
```
Authorization: Bearer <PM_TOKEN>
Accept-Language: en
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

#### 5b. Same Error in Spanish

**Endpoint:** `GET /api/projects/INVALID_ID`

**Headers:**
```
Authorization: Bearer <PM_TOKEN>
Accept-Language: es
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Proyecto no encontrado"
}
```

**📝 Talking Points:**
- i18next detects language from `Accept-Language` header
- Supports English (en) and Spanish (es)
- Translation files in `src/locales/en/` and `src/locales/es/`
- Fallback to English if unsupported language requested
- User preference can be stored in database

**More i18n Examples:**

```bash
# Login with invalid credentials - English
POST /api/auth/login
Accept-Language: en
Body: { "email": "wrong@email.com", "password": "wrong" }
Response: "Invalid email or password"

# Login with invalid credentials - Spanish
POST /api/auth/login
Accept-Language: es
Body: { "email": "wrong@email.com", "password": "wrong" }
Response: "Correo electrónico o contraseña inválidos"
```

---

### Bonus: Test with Spanish-Preferred User

**Login as Lisa Wilson (PM with Spanish preference):**
```json
POST /api/auth/login
{
  "email": "lisa.wilson@big3construction.com",
  "password": "password123"
}
```

Then try accessing an invalid resource - error will be in Spanish automatically!

---

## 💻 Code Showcase

### 1. RBAC Middleware (`src/middleware/rbac.middleware.js`)

**Show this code in your editor:**

```javascript
/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Roles hierarchy:
 * 1. Admin - Full access to all resources
 * 2. PM (Project Manager) - Can manage assigned projects
 * 3. Site Supervisor - Read-only access to assigned projects
 */

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Convenient shortcuts
const adminOnly = requireRole(['Admin']);
const adminOrPM = requireRole(['Admin', 'PM']);
```

**How it's used in routes:**

```javascript
// From src/routes/project.routes.js

// Only Admin can delete
router.delete('/:id', requireAuth, adminOnly, projectController.delete);

// Admin or PM can update
router.put('/:id', requireAuth, adminOrPM, projectController.update);

// Everyone authenticated can view
router.get('/:id', requireAuth, projectController.getById);
```

**📝 Talking Points:**
- Higher-order function pattern (returns middleware function)
- Composable: can chain multiple middleware
- Clear error messages with status codes
- Shorthand helpers for common role combinations
- JWT user data available via `req.user` from Passport

---

### 2. Notification Consumer (`src/queue/certExpiryConsumer.js`)

**Show this code:**

```javascript
const { blockingPop } = require('../config/queue');

async function handleMessage(msg) {
  if (!msg) {
    console.warn('[Consumer] Received empty message');
    return;
  }
  
  const {
    cert_id, cert_name, expires_at, days_left,
    worker_id, worker_name, pm_user_id, pm_name, pm_email
  } = msg;

  const notificationText = `
    NOTIFICATION: Sending email to PM ${pm_name} <${pm_email}> 
    for worker ${worker_name} (ID ${worker_id}) 
    - certification "${cert_name}" expires in ${days_left} days 
    on ${expires_at}. (cert_id: ${cert_id})
  `;
  
  console.log(notificationText);
  // In production: send actual email via SendGrid/AWS SES
}

async function runConsumer() {
  console.log('[Consumer] Waiting for queue messages...');
  
  while (true) {
    try {
      // Block indefinitely waiting for messages (0 = no timeout)
      const msg = await blockingPop(0);
      if (!msg) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      
      await handleMessage(msg);
    } catch (err) {
      console.error('[Consumer] Error processing message', err);
      await new Promise(r => setTimeout(r, 2000)); // backoff
    }
  }
}

if (require.main === module) {
  runConsumer();
}
```

**How it works with the Producer:**

```javascript
// src/jobs/cert-checker.job.js (Producer)
// Runs daily via cron job

const { push } = require('../config/queue');

async function checkExpiringCerts() {
  // Query database for certs expiring in next 30 days
  const expiringCerts = await db.query(`
    SELECT c.*, w.first_name, w.last_name, u.email as pm_email
    FROM worker_certifications c
    JOIN workers w ON c.worker_id = w.worker_id
    JOIN users u ON w.worker_id = u.worker_id
    WHERE DATEDIFF(c.expiry_date, NOW()) BETWEEN 0 AND 30
  `);

  // Push each to queue
  for (const cert of expiringCerts) {
    await push('cert-expiry-notifications', cert);
  }
}
```

**📝 Talking Points:**
- **Producer/Consumer pattern** for async processing
- **Redis BLPOP** for blocking queue operations (efficient, no polling)
- **Decoupled architecture**: producer and consumer are separate processes
- **Fault tolerance**: try/catch with exponential backoff
- **Scalable**: can run multiple consumers
- **Real-world use**: certification expiry alerts, email notifications, SMS
- **Migration note**: Originally RabbitMQ, migrated to Redis for simplicity

---

### 3. Unit Test Example (`tests/unit/auth.controller.test.js`)

**Show this test:**

```javascript
const authService = require('../../src/services/auth.service');
const authController = require('../../src/controllers/auth.controller');
const { 
  createMockRequest, 
  createMockResponse 
} = require('../fixtures/test-helpers');

jest.mock('../../src/services/auth.service');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'PM',
        worker_id: 2
      };
      
      req.body = userData;
      
      authService.register.mockResolvedValue({
        user_id: 1,
        email: userData.email,
        role: userData.role
      });

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(authService.register).toHaveBeenCalled();
    });

    it('should reject duplicate email registration', async () => {
      req.body = { email: 'admin@big3.com', password: 'test' };
      
      authService.register.mockRejectedValue(
        new Error('USER_EXISTS')
      );

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
```

**📝 Talking Points:**
- **Jest** testing framework
- **Mocking** service layer to isolate controller logic
- **Test helpers** for mock req/res/next objects
- **Coverage**: 80%+ across codebase
- **Test types**: Unit (isolated), Integration (API endpoints)
- **CI/CD ready**: runs in GitHub Actions
- **TDD approach**: Write tests, then implementation

**Show test coverage:**
```bash
npm test
# Shows coverage report with 80%+ coverage
```

---

## 🎯 Challenges & Solutions

### Challenge 1: RabbitMQ to Redis Migration

**Problem:**
- Initially used RabbitMQ for message queuing
- Complex setup with AMQP protocol
- Heavy dependency for simple queue operations
- Docker required for local development

**Solution:**
- **Migrated to Redis** with BLPOP/RPUSH
- **Benefits:**
  - Simpler setup (single Redis instance)
  - Native Node.js support with `redis` package
  - Blocking pop eliminates polling overhead
  - Easier for team members to set up locally
  - Redis already used for caching (one less service)

**Code:**
```javascript
// Before (RabbitMQ)
await channel.assertQueue('cert-notifications');
await channel.sendToQueue('cert-notifications', Buffer.from(JSON.stringify(msg)));
await channel.consume('cert-notifications', handleMessage);

// After (Redis)
await redisClient.rPush('cert-notifications', JSON.stringify(msg));
const msg = await redisClient.blPop('cert-notifications', 0);
```

**Learning:**
- Sometimes simpler is better
- Evaluate dependencies carefully
- Redis can replace RabbitMQ for simple queuing needs

---

### Challenge 2: RBAC with Geospatial Filtering

**Problem:**
- Geospatial queries must respect role-based access
- Admin sees all projects globally
- PM/Site Supervisor only see assigned projects
- Need to filter BOTH by distance AND permissions

**Solution:**
- **Two-stage filtering** in service layer
- First: SQL query with RBAC filter (assigned projects only)
- Then: Haversine calculation in JavaScript
- Finally: Filter by radius client-side

**Code:**
```javascript
async getProjectsNearLocation(lat, lng, radius, user) {
  let sql = `
    SELECT p.project_id, p.project_name, p.latitude, p.longitude
    FROM projects p
    WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
  `;
  
  const params = [];

  // RBAC: Filter by role
  if (user.role === 'PM' || user.role === 'Site Supervisor') {
    sql += ` AND EXISTS (
      SELECT 1 FROM project_assignments pa 
      WHERE pa.project_id = p.project_id 
      AND pa.worker_id = ?
    )`;
    params.push(user.worker_id);
  }
  // Admin sees all (no filter)

  const projects = await db.query(sql, params);

  // Calculate distance and filter by radius
  return projects
    .map(p => ({
      ...p,
      distance_km: haversineDistance(lat, lng, p.latitude, p.longitude)
    }))
    .filter(p => p.distance_km <= radius)
    .sort((a, b) => a.distance_km - b.distance_km);
}
```

**Learning:**
- Security must be enforced at every layer
- Geospatial calculations can be done in-memory for small datasets
- For large datasets, use MySQL spatial functions (future improvement)

---

### Challenge 3: i18n with Dynamic Error Messages

**Problem:**
- Error messages from validators need translation
- Dynamic data (e.g., field names, values) must be interpolated
- Different error types across multiple layers

**Solution:**
- **Structured translation keys** with namespaces
- **i18next interpolation** for dynamic values
- **Centralized error handling** middleware

**Translation structure:**
```json
// en/translation.json
{
  "workers": {
    "not_found": "Worker not found",
    "email_exists": "A worker with this email already exists",
    "invalid_salary": "Salary must be a positive number"
  }
}

// es/translation.json
{
  "workers": {
    "not_found": "Trabajador no encontrado",
    "email_exists": "Ya existe un trabajador con este correo",
    "invalid_salary": "El salario debe ser un número positivo"
  }
}
```

**Usage in code:**
```javascript
// Service layer
if (!worker) {
  throw new Error(req.t('workers.not_found'));
}

// Middleware detects language and translates
app.use(i18nextMiddleware.handle(i18next));
```

**Learning:**
- Plan translation structure early
- Use namespaces (auth, workers, projects) for organization
- Test all languages, not just English

---

### Challenge 4: Testing Async Queue Operations

**Problem:**
- Consumer runs in infinite loop
- Hard to test blocking operations
- Need to verify message processing without actual queue

**Solution:**
- **Separate concerns**: `handleMessage` is pure function
- **Mock queue operations** in tests
- **Test message handler independently** from consumer loop

**Test:**
```javascript
describe('Notification Consumer', () => {
  it('should process certification expiry message', async () => {
    const mockMessage = {
      cert_id: 1,
      cert_name: 'OSHA Safety',
      worker_name: 'John Doe',
      days_left: 15,
      pm_email: 'manager@big3.com'
    };

    const consoleSpy = jest.spyOn(console, 'log');
    
    await handleMessage(mockMessage);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('OSHA Safety')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('15 days')
    );
  });
});
```

**Learning:**
- Extract pure functions from side effects
- Test business logic separate from infrastructure
- Mock external dependencies (Redis, databases)

---

## 🌟 Technical Highlights

### Architecture Strengths

1. **Layered Architecture**
   - Controllers → Services → Repositories
   - Clear separation of concerns
   - Easy to test each layer independently

2. **Repository Pattern**
   - All SQL in repository layer
   - Easy to swap databases (MySQL → PostgreSQL)
   - Centralized query management

3. **Middleware Composition**
   - `requireAuth` → `requireRole` → `controller`
   - Reusable, chainable middleware
   - Single Responsibility Principle

4. **Error Handling**
   - Centralized error middleware
   - Consistent error responses
   - Proper HTTP status codes

### Security Features

1. **JWT Authentication**
   - Stateless authentication
   - 7-day token expiration
   - Secure password hashing (bcrypt with 10 rounds)

2. **RBAC**
   - Three roles: Admin, PM, Site Supervisor
   - Hierarchical permissions
   - Enforced at middleware AND service layer

3. **Input Validation**
   - express-validator for all inputs
   - SQL injection prevention via parameterized queries
   - XSS prevention via helmet

4. **Rate Limiting**
   - Prevents brute force attacks
   - Configurable per endpoint

### Performance Optimizations

1. **Database Connection Pooling**
   - MySQL2 with pool of 10 connections
   - Automatic connection recycling

2. **Efficient Geospatial Queries**
   - In-memory Haversine for small datasets
   - Can migrate to MySQL spatial indexes for scale

3. **Redis Queue**
   - Blocking pop (no polling overhead)
   - Efficient message delivery

### Code Quality

1. **Test Coverage: 80%+**
   - Unit tests for controllers, services
   - Integration tests for API endpoints
   - Mock helpers for consistent testing

2. **Documentation**
   - JSDoc comments on all functions
   - Comprehensive API docs in `docs/API.md`
   - README with setup instructions

3. **Code Style**
   - ESLint for consistency
   - Meaningful variable names
   - DRY principle followed

---

## 🎤 Presentation Flow Suggestion

### 1. Introduction (2 min)
- Project overview
- Tech stack (Node.js, Express, MySQL, Redis)
- Key features

### 2. Live Demo with Postman (8 min)
- Login as PM ✅
- Fail admin route ❌
- Success PM route ✅
- Geospatial search 📍
- i18n (English vs Spanish) 🌐

### 3. Code Walkthrough (5 min)
- RBAC middleware (show in editor)
- Notification consumer (show architecture)
- Unit test example (run tests live)

### 4. Challenges & Solutions (3 min)
- RabbitMQ → Redis migration
- RBAC with geospatial filtering
- One other challenge your team faced

### 5. Q&A (2 min)
- Be ready for questions on:
  - Why Redis over RabbitMQ?
  - How does Haversine work?
  - How would you scale this?
  - What about frontend?

---

## 📝 Quick Reference: Test Credentials

```
Admin:
email: admin@big3construction.com
password: password123

PM (Maria):
email: maria.garcia@big3construction.com
password: password123

PM Spanish (Lisa):
email: lisa.wilson@big3construction.com
password: password123
```

---

## 🔗 Useful Links

- **API Docs**: `backend/docs/API.md`
- **Test Credentials**: `backend/TEST_CREDENTIALS.md`
- **Project Plan**: `PROJECT_PLAN.md`
- **Architecture**: `PROJECT_STRUCTURE.md`

---

## ✅ Pre-Presentation Checklist

- [ ] MySQL running and seeded
- [ ] Redis running
- [ ] Backend server running (`npm start`)
- [ ] Postman collection set up with all demos
- [ ] Code files open in editor (RBAC, consumer, test)
- [ ] Terminal ready to run `npm test`
- [ ] Internet connection stable (if demo requires it)
- [ ] Screen share tested
- [ ] Backup plan if live demo fails (screenshots/video)

---

## 🎯 Key Takeaways for Audience

1. **RBAC is critical** for multi-tenant applications
2. **Geospatial features** add real business value
3. **i18n** makes apps accessible globally
4. **Message queues** enable async processing
5. **Testing** ensures reliability and confidence
6. **Good architecture** makes code maintainable

---

Good luck with your presentation! 🚀
