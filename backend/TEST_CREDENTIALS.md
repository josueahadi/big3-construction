# Test User Credentials & API Testing Guide

## Available Test Users

All users have the password: **`password123`**

### 1. Admin Account (Full Access)
```
Email:    admin@big3construction.com
Password: password123
Role:     Admin
Access:   Full access to all resources (create, read, update, delete)
Language: English
```

### 2. Project Manager #1 (Maria Garcia)
```
Email:    maria.garcia@big3construction.com
Password: password123
Role:     PM
Access:   Can manage assigned projects, create/update resources
Language: English
```

### 3. Project Manager #2 (Lisa Wilson)
```
Email:    lisa.wilson@big3construction.com
Password: password123
Role:     PM
Access:   Can manage assigned projects, create/update resources
Language: Spanish (Preferred - good for testing i18n!)
```

### 4. Site Supervisor #1 (John Johnson)
```
Email:    john.johnson@big3construction.com
Password: password123
Role:     Site Supervisor
Access:   Read-only access to assigned projects
Language: English
```

### 5. Site Supervisor #2 (Michael Brown)
```
Email:    michael.brown@big3construction.com
Password: password123
Role:     Site Supervisor
Access:   Read-only access to assigned projects
Language: English
```

---

## How to Get JWT Tokens

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
The server should be running on: `http://localhost:5001`

### Step 2: Login to Get JWT Token

**Using curl:**
```bash
# Admin Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@big3construction.com",
    "password": "password123"
  }'
```

**Using Postman/Thunder Client:**
1. Method: `POST`
2. URL: `http://localhost:5001/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "admin@big3construction.com",
  "password": "password123"
}
```

### Step 3: Copy the JWT Token

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "admin@big3construction.com",
    "role": "Admin"
  }
}
```

Copy the entire `token` value (the long string starting with `eyJ...`)

---

## 🔨 Testing Protected Endpoints

### Example 1: Test Geospatial Search (Phase 4)

**Find projects near Accra, Ghana (50km radius):**
```bash
curl -X GET "http://localhost:5001/api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "search_location": {
    "latitude": 5.6037,
    "longitude": -0.1870,
    "radius_km": 50
  },
  "message": "Search completed successfully",
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_city": "Accra",
      "latitude": 5.6037,
      "longitude": -0.187,
      "distance_km": 0
    },
    {
      "project_id": "P003",
      "project_name": "Office Complex",
      "site_city": "Accra",
      "latitude": 5.6037,
      "longitude": -0.187,
      "distance_km": 0
    }
  ]
}
```

### Example 2: Test Multilingual Support (Phase 5)

**Get projects in Spanish:**
```bash
curl -X GET "http://localhost:5001/api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept-Language: es"
```

**Expected Response (Spanish):**
```json
{
  "success": true,
  "message": "Búsqueda completada exitosamente",
  "data": [...]
}
```

**Test with Invalid Coordinates (Spanish Error):**
```bash
curl -X GET "http://localhost:5001/api/projects/nearme?lat=100&lng=-0.1870&radius=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept-Language: es"
```

**Expected Error (Spanish):**
```json
{
  "success": false,
  "error": "La latitud debe estar entre -90 y 90"
}
```

### Example 3: Test RBAC (Role-Based Access Control)

**Try to create a project as Site Supervisor (should fail):**
```bash
# First, login as Site Supervisor
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.johnson@big3construction.com",
    "password": "password123"
  }'

# Then try to create a project (should get 403 Forbidden)
curl -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer SITE_SUPERVISOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "P999",
    "project_name": "Test Project",
    "site_city": "Accra",
    "budget": 100000,
    "client_id": 1
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

---

## Quick Test Checklist

### Phase 4: Geospatial Search
- [ ] Login as Admin and get JWT token
- [ ] Test `/api/projects/nearme` with valid coordinates (Ghana cities)
- [ ] Test with invalid latitude (> 90 or < -90)
- [ ] Test with invalid longitude (> 180 or < -180)
- [ ] Test with negative radius
- [ ] Test with missing parameters
- [ ] Verify distance calculations are accurate
- [ ] Verify results are sorted by distance

### Phase 5: Multilingual Support
- [ ] Test with `Accept-Language: en` header (should get English)
- [ ] Test with `Accept-Language: es` header (should get Spanish)
- [ ] Login as Lisa Wilson (Spanish preferred language)
- [ ] Verify error messages appear in correct language
- [ ] Test success messages in both languages

### RBAC Testing
- [ ] Admin can create/update/delete all resources
- [ ] PM can update projects but not delete
- [ ] Site Supervisor can only read (no create/update/delete)
- [ ] Unauthenticated requests get 401
- [ ] Invalid tokens get 401

---

## Useful Endpoints for Testing

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user (Admin only)

### Projects (Geospatial)
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/nearme?lat=X&lng=Y&radius=Z` - **Geospatial search**
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin/PM)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Other APIs
- `GET /api/workers` - List workers
- `GET /api/clients` - List clients
- `GET /api/materials` - List materials
- `GET /api/suppliers` - List suppliers

---

## Troubleshooting

### "Token expired" Error
JWT tokens expire after a certain time. Login again to get a fresh token.

### "Unauthorized" Error
Make sure you're including the `Authorization: Bearer TOKEN` header.

### "Validation failed" Error
Check that your request body matches the required format. Use the examples above.

### "Database error" Error
Make sure you've run all migrations in order:
1. `migrations/01_setup_database.sql`
2. `migrations/02_insert_data.sql`
3. `migrations/07_migrations.sql` ← **Adds geospatial + users table**
4. `migrations/08_seed_users.sql` ← **Creates test users**

---

## Security Notes

**FOR TESTING ONLY!**

---

**Need help?** Check [backend/README.md](README.md)