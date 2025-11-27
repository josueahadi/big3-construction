# Backend Testing Guide
## Big3 Construction API — Practical Testing Workflow

---

## Prerequisites

- Database initialized with migrations 01, 02, 07, 08
- Node.js 18+ and npm installed
- Redis running (for queue tests) — optional for basic API

---

## 1) Start the Backend

From the `backend` directory:

```bash
npm install
npm run dev
```

API runs at `http://localhost:5001`.

Health check:
```bash
curl http://localhost:5001/health
```

---

## 2) Authenticate and Get a Token

Login with a seeded user (passwords are `password123`):

```bash
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@big3construction.com","password":"password123"}' | jq -r .token)
echo $TOKEN
```

Verify token works:
```bash
curl -s http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 3) Internationalization (i18n)

Most error/success messages are localized based on `Accept-Language`.

Example: Request a non-existent project in Spanish:
```bash
curl -s http://localhost:5001/api/projects/P99999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Language: es" | jq
```

Expected message: "Proyecto no encontrado".

Switch back to English:
```bash
curl -s http://localhost:5001/api/projects/P99999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Language: en" | jq
```

---

## 4) RBAC Checks (Admin vs PM)

Some endpoints are Admin-only (e.g., create project). Others allow Admin or PM.

Login as a PM:
```bash
PM_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.garcia@big3construction.com","password":"password123"}' | jq -r .token)
```

Attempt Admin-only action with PM (should be 403):
```bash
curl -i -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"P777","project_name":"Test Project","budget":50000}'
```

Create with Admin (should succeed):
```bash
curl -s -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"P777","project_name":"Test Project","budget":50000}' | jq
```

Update with Admin or PM (should work with either):
```bash
curl -s -X PUT http://localhost:5001/api/projects/P777 \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budget":75000}' | jq
```

Delete with Admin (Admin-only):
```bash
curl -s -X DELETE http://localhost:5001/api/projects/P777 \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 5) Geospatial Search

Find nearby projects by coordinates and radius (km):
```bash
curl -s "http://localhost:5001/api/projects/nearme?lat=5.6037&lng=-0.1870&radius=50" \
  -H "Authorization: Bearer $TOKEN" | jq
```

The response includes `distance_km` for each project. Ensure you pass numeric `lat`/`lng`.

---

## 6) Common CRUD Smoke Tests

List projects:
```bash
curl -s http://localhost:5001/api/projects \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
```

Get a known project (adjust ID if needed):
```bash
curl -s http://localhost:5001/api/projects/P001 \
  -H "Authorization: Bearer $TOKEN" | jq
```

Workers:
```bash
curl -s http://localhost:5001/api/workers \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
```

---

## 7) Notification Queue (Optional)

Requires Redis. You can test via npm scripts:

Terminal 1 — start consumer:
```bash
cd backend
npm run consumer
```

Terminal 2 — run producer (enqueues expiring certifications):
```bash
cd backend
npm run cert-checker
```

You should see the consumer processing notifications. Configure with `.env`:
`CERT_EXPIRY_WARNING_DAYS`, `CERT_CHECK_CRON`, `CERT_QUEUE_NAME`.

---

## 8) Automated Tests (Jest)

Run the full suite:
```bash
cd backend
npm test
```

Open coverage report:
```bash
open coverage/lcov-report/index.html
```

Run focused tests:
```bash
npm run test:unit
npm run test:integration
```

---

## Troubleshooting

- 401 Unauthorized: Missing/invalid JWT in `Authorization: Bearer <token>`.
- 403 Forbidden: Your role lacks permission for the endpoint.
- DB errors: Verify migrations `01 → 02 → 07 → 08` were run on `big3_construction`.
- Redis errors: Ensure Redis is running and `.env` has correct host/port.

For deeper details see `backend/README.md` and `docs/API.md`.
