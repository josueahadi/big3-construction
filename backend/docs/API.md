# Big3 Construction API Documentation

Complete API reference for the Big3 Construction Management System.

## Testing the API

You can test these endpoints using:
- **Postman** (recommended) - Import the examples below as a collection
- **curl** - Command line examples provided for each endpoint
- **Thunder Client** - VS Code extension
- **Insomnia** or any other HTTP client

> **Quick Start:** See [TEST_CREDENTIALS.md](../TEST_CREDENTIALS.md) for ready-to-use test accounts and Postman setup instructions.

## Base URL

```
http://localhost:5001/api
```

## Table of Contents

- [Authentication](#authentication)
- [Projects](#projects)
- [Workers](#workers)
- [Clients](#clients)
- [Materials](#materials)
- [Suppliers](#suppliers)
- [Geospatial Search](#geospatial-search)
- [Multilingual Support](#multilingual-support)
- [Error Responses](#error-responses)
- [Role-Based Access Control](#role-based-access-control)

---

## Authentication

### Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "PM",
  "worker_id": 2
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "PM"
  }
}
```

**Validation:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `role`: Required, one of: `Admin`, `PM`, `Site Supervisor`
- `worker_id`: Optional, must reference existing worker

---

### Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@big3construction.com",
  "password": "password123"
}
```

**Response:** `200 OK`
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

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## Projects

All project endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### List All Projects

Returns all projects with optional filtering.

**Endpoint:** `GET /api/projects`

**Query Parameters:**
- `city` (optional): Filter by site city
- `client_id` (optional): Filter by client
- `status` (optional): Filter by status

**Example Request:**
```http
GET /api/projects?city=Accra&status=active
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_address": "123 Main St",
      "site_city": "Accra",
      "start_date": "2024-01-15",
      "end_date": "2024-12-31",
      "budget": 500000.00,
      "client_id": 1,
      "client_name": "ABC Corporation",
      "latitude": 5.6037,
      "longitude": -0.1870
    }
  ]
}
```

---

### Get Project by ID

Returns detailed information about a specific project.

**Endpoint:** `GET /api/projects/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project_id": "P001",
    "project_name": "Downtown Plaza",
    "site_address": "123 Main St",
    "site_city": "Accra",
    "start_date": "2024-01-15",
    "end_date": "2024-12-31",
    "budget": 500000.00,
    "client": {
      "client_id": 1,
      "client_name": "ABC Corporation",
      "client_phone": "555-1000"
    },
    "assigned_workers": [
      {
        "worker_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "assignment_date": "2024-01-15"
      }
    ],
    "materials": [
      {
        "material_id": 1,
        "material_name": "Cement",
        "quantity": 100,
        "total_cost": 5000.00
      }
    ]
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Create Project

Creates a new project. **Admin only**.

**Endpoint:** `POST /api/projects`

**Request Body:**
```json
{
  "project_id": "P002",
  "project_name": "Harbor Bridge",
  "site_address": "Harbor Road",
  "site_city": "Tema",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "budget": 1000000,
  "client_id": 2,
  "latitude": 5.6698,
  "longitude": 0.0166
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project_id": "P002",
    "project_name": "Harbor Bridge",
    "site_city": "Tema"
  }
}
```

**Validation:**
- `project_id`: Required, format P### (e.g., P001), unique
- `project_name`: Required
- `site_city`: Required
- `start_date`: Required, valid date format (YYYY-MM-DD)
- `end_date`: Optional, must be after start_date
- `budget`: Required, positive number
- `client_id`: Required, must reference existing client

**Error Response:** `403 Forbidden`
```json
{
  "success": false,
  "error": "Insufficient permissions. Admin role required."
}
```

---

### Update Project

Updates an existing project. **Admin or PM**.

**Endpoint:** `PUT /api/projects/:id`

**Request Body:** (all fields optional)
```json
{
  "budget": 1100000,
  "end_date": "2026-01-31"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project_id": "P002",
    "budget": 1100000.00,
    "end_date": "2026-01-31"
  }
}
```

---

### Delete Project

Deletes a project. **Admin only**.

**Endpoint:** `DELETE /api/projects/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Cannot delete project with existing assignments"
}
```

---

## Workers

### List All Workers

Returns all workers.

**Endpoint:** `GET /api/workers`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "worker_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone": "555-1234",
      "salary": 50000.00
    },
    {
      "worker_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "phone": "555-5678",
      "salary": 55000.00
    }
  ]
}
```

---

### Get Worker by ID

Returns detailed worker information including certifications.

**Endpoint:** `GET /api/workers/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "worker_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "555-1234",
    "salary": 50000.00,
    "certifications": [
      {
        "cert_id": 1,
        "cert_name": "Basic Safety Training",
        "expiry_date": "2025-12-31"
      },
      {
        "cert_id": 2,
        "cert_name": "Forklift License",
        "expiry_date": "2026-06-30"
      }
    ],
    "projects": [
      {
        "project_id": "P001",
        "project_name": "Downtown Plaza",
        "assignment_date": "2024-01-15"
      }
    ]
  }
}
```

---

### Create Worker

Creates a new worker. **Admin only**.

**Endpoint:** `POST /api/workers`

**Request Body:**
```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "phone": "555-9999",
  "salary": 52000
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Worker created successfully",
  "data": {
    "worker_id": 3,
    "first_name": "Alice",
    "last_name": "Johnson",
    "phone": "555-9999",
    "salary": 52000.00
  }
}
```

**Validation:**
- `first_name`: Required
- `last_name`: Required
- `phone`: Optional, valid format
- `salary`: Optional, positive number

---

### Update Worker

Updates worker details. **Admin only**.

**Endpoint:** `PUT /api/workers/:id`

**Request Body:** (all fields optional)
```json
{
  "salary": 60000,
  "phone": "555-1111"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Worker updated successfully",
  "data": {
    "worker_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "555-1111",
    "salary": 60000.00
  }
}
```

---

### Delete Worker

Deletes a worker. **Admin only**.

**Endpoint:** `DELETE /api/workers/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Worker deleted successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Cannot delete worker with existing project assignments"
}
```

---

### Add Certification to Worker

Adds a certification to a worker.

**Endpoint:** `POST /api/workers/:id/certifications`

**Request Body:**
```json
{
  "cert_name": "Advanced Scaffolding",
  "expiry_date": "2027-03-15"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Certification added successfully",
  "data": {
    "cert_id": 5,
    "cert_name": "Advanced Scaffolding",
    "expiry_date": "2027-03-15",
    "worker_id": 1
  }
}
```

**Validation:**
- `cert_name`: Required
- `expiry_date`: Required, valid date format (YYYY-MM-DD)

---

### Update Certification

Updates a worker's certification.

**Endpoint:** `PUT /api/workers/:worker_id/certifications/:cert_id`

**Request Body:**
```json
{
  "expiry_date": "2028-03-15"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Certification updated successfully"
}
```

---

### Delete Certification

Removes a certification from a worker.

**Endpoint:** `DELETE /api/workers/:worker_id/certifications/:cert_id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Certification deleted successfully"
}
```

---

## Clients

### List All Clients

**Endpoint:** `GET /api/clients`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "client_id": 1,
      "client_name": "ABC Corporation",
      "client_phone": "555-1000"
    }
  ]
}
```

---

### Get Client by ID

**Endpoint:** `GET /api/clients/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "client_name": "ABC Corporation",
    "client_phone": "555-1000",
    "projects": [
      {
        "project_id": "P001",
        "project_name": "Downtown Plaza",
        "start_date": "2024-01-15"
      }
    ]
  }
}
```

---

### Create Client

**Endpoint:** `POST /api/clients` (Admin only)

**Request Body:**
```json
{
  "client_name": "XYZ Industries",
  "client_phone": "555-2000"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client_id": 2,
    "client_name": "XYZ Industries",
    "client_phone": "555-2000"
  }
}
```

---

### Update Client

**Endpoint:** `PUT /api/clients/:id` (Admin only)

**Request Body:**
```json
{
  "client_phone": "555-2001"
}
```

**Response:** `200 OK`

---

### Delete Client

**Endpoint:** `DELETE /api/clients/:id` (Admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

## Materials

### List All Materials

**Endpoint:** `GET /api/materials`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "material_id": 1,
      "material_name": "Cement",
      "unit_cost": 50.00
    },
    {
      "material_id": 2,
      "material_name": "Steel Rebar",
      "unit_cost": 150.00
    }
  ]
}
```

---

### Get Material by ID

**Endpoint:** `GET /api/materials/:id`

**Response:** `200 OK`

---

### Create Material

**Endpoint:** `POST /api/materials` (Admin only)

**Request Body:**
```json
{
  "material_name": "Concrete Blocks",
  "unit_cost": 25.00
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "material_id": 3,
    "material_name": "Concrete Blocks",
    "unit_cost": 25.00
  }
}
```

---

### Update Material

**Endpoint:** `PUT /api/materials/:id` (Admin only)

---

### Delete Material

**Endpoint:** `DELETE /api/materials/:id` (Admin only)

---

## Suppliers

### List All Suppliers

**Endpoint:** `GET /api/suppliers`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "supplier_id": 1,
      "supplier_name": "BuildMart",
      "supplier_phone": "555-3000"
    }
  ]
}
```

---

### Create Supplier

**Endpoint:** `POST /api/suppliers` (Admin only)

**Request Body:**
```json
{
  "supplier_name": "Construction Depot",
  "supplier_phone": "555-4000"
}
```

**Response:** `201 Created`

---

### Update Supplier

**Endpoint:** `PUT /api/suppliers/:id` (Admin only)

---

### Delete Supplier

**Endpoint:** `DELETE /api/suppliers/:id` (Admin only)

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Cannot delete supplier with existing material supplies. Delete supplies first."
}
```

---

## Geospatial Search

### Find Projects Near Location

Finds projects within a specified radius of coordinates.

**Endpoint:** `GET /api/projects/nearme`

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (required): Search radius in kilometers

**Example Request:**
```http
GET /api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "project_id": "P001",
      "project_name": "Downtown Plaza",
      "site_city": "Accra",
      "site_address": "123 Main St",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "distance_km": 2.5
    },
    {
      "project_id": "P003",
      "project_name": "Airport Terminal",
      "site_city": "Accra",
      "site_address": "Airport Road",
      "latitude": 5.6050,
      "longitude": -0.1670,
      "distance_km": 15.3
    }
  ],
  "count": 2,
  "search_params": {
    "latitude": 5.6037,
    "longitude": -0.187,
    "radius_km": 50
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Missing required parameters: lat, lng, radius"
}
```

---

## Multilingual Support

All API endpoints support multiple languages via the `Accept-Language` header.

### Supported Languages

- `en` - English (default)
- `es` - Spanish

### Usage

**English (default):**
```http
GET /api/workers/999
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": false,
  "error": "Worker not found"
}
```

**Spanish:**
```http
GET /api/workers/999
Authorization: Bearer <token>
Accept-Language: es
```

**Response:**
```json
{
  "success": false,
  "error": "Trabajador no encontrado"
}
```

### Validation Error Examples

**English:**
```json
{
  "success": false,
  "error": "First name is required"
}
```

**Spanish:**
```json
{
  "success": false,
  "error": "Se requiere el nombre"
}
```

---

## Error Responses

All endpoints follow a consistent error response format.

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Format

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions. Admin role required."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed: First name is required"
}
```

---

## Role-Based Access Control

### Permission Matrix

| Endpoint | Admin | PM | Site Supervisor |
|----------|-------|----|-----------------|
| **Projects** | | | |
| GET /api/projects | ✅ | ✅ | ✅ |
| POST /api/projects | ✅ | ❌ | ❌ |
| PUT /api/projects | ✅ | ✅ | ❌ |
| DELETE /api/projects | ✅ | ❌ | ❌ |
| **Workers** | | | |
| GET /api/workers | ✅ | ✅ | ✅ |
| POST /api/workers | ✅ | ❌ | ❌ |
| PUT /api/workers | ✅ | ❌ | ❌ |
| DELETE /api/workers | ✅ | ❌ | ❌ |
| POST /certifications | ✅ | ✅ | ✅ |
| **Clients** | | | |
| GET /api/clients | ✅ | ✅ | ✅ |
| POST /api/clients | ✅ | ❌ | ❌ |
| PUT /api/clients | ✅ | ❌ | ❌ |
| DELETE /api/clients | ✅ | ❌ | ❌ |
| **Materials** | | | |
| GET /api/materials | ✅ | ✅ | ✅ |
| POST /api/materials | ✅ | ❌ | ❌ |
| PUT /api/materials | ✅ | ❌ | ❌ |
| DELETE /api/materials | ✅ | ❌ | ❌ |
| **Suppliers** | | | |
| GET /api/suppliers | ✅ | ✅ | ✅ |
| POST /api/suppliers | ✅ | ❌ | ❌ |
| PUT /api/suppliers | ✅ | ❌ | ❌ |
| DELETE /api/suppliers | ✅ | ❌ | ❌ |
| **Geospatial** | | | |
| GET /api/projects/nearme | ✅ | ✅ | ✅ |

---

## Test Credentials

Use these credentials for testing the API:

### Admin Account
```
Email: admin@big3construction.com
Password: password123
```

### Project Manager Account
```
Email: maria.garcia@big3construction.com
Password: password123
```

### Site Supervisor Account
```
Email: john.johnson@big3construction.com
Password: password123
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (900000ms)
- **Max Requests:** 100 per window per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

---

## Notes

- All dates must be in ISO 8601 format (YYYY-MM-DD)
- All monetary values are in the project's base currency
- Timestamps are in UTC
- All responses include a `success` boolean field
- JWT tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN` env var)

---

For setup instructions and testing the API locally, see [README.md](../README.md).
