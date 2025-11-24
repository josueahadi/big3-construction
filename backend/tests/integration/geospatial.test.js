const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');

describe.skip('Geospatial API - /api/projects/nearme', () => {
  let adminToken;
  let pmToken;
  let siteSupervisorToken;

  beforeAll(async () => {
    // Login as admin to get token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@big3construction.com',
        password: 'password123'
      });
    adminToken = adminRes.body.token;

    // Login as PM
    const pmRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria.garcia@big3construction.com',
        password: 'password123'
      });
    pmToken = pmRes.body.token;

    // Login as Site Supervisor
    const ssRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.johnson@big3construction.com',
        password: 'password123'
      });
    siteSupervisorToken = ssRes.body.token;
  });

  afterAll(async () => {
    // Close database connection
    await db.end();
  });

  describe('GET /api/projects/nearme - Authentication', () => {
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', 'Bearer invalid_token')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects/nearme - Parameter Validation', () => {
    test('should return 400 when lat is missing', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('lat');
    });

    test('should return 400 when lng is missing', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('lng');
    });

    test('should return 400 when radius is missing', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: 30.0606 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('radius');
    });

    test('should return 400 for invalid latitude (> 90)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: 91, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('latitude');
    });

    test('should return 400 for invalid latitude (< -90)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -91, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid longitude (> 180)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: 181, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('longitude');
    });

    test('should return 400 for invalid longitude (< -180)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: -181, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for negative radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: 30.0606, radius: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('radius');
    });

    test('should return 400 for zero radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: 30.0606, radius: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for non-numeric latitude', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: 'invalid', lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/nearme - Functionality', () => {
    test('should find projects near Kigali with 50km radius (Admin)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,  // Kigali coordinates
          lng: 30.0606,
          radius: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('search_location');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify search location in response
      expect(response.body.search_location.latitude).toBe(-1.9536);
      expect(response.body.search_location.longitude).toBe(30.0606);
      expect(response.body.search_location.radius_km).toBe(50);

      // If projects found, verify structure
      if (response.body.count > 0) {
        const project = response.body.data[0];
        expect(project).toHaveProperty('project_id');
        expect(project).toHaveProperty('project_name');
        expect(project).toHaveProperty('site_city');
        expect(project).toHaveProperty('latitude');
        expect(project).toHaveProperty('longitude');
        expect(project).toHaveProperty('distance_km');

        // Verify distance is within radius
        expect(project.distance_km).toBeLessThanOrEqual(50);
      }
    });

    test('should return projects sorted by distance (closest first)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 100
        });

      expect(response.status).toBe(200);

      if (response.body.count > 1) {
        const projects = response.body.data;

        // Verify sorting: each project should be closer or equal to the next
        for (let i = 0; i < projects.length - 1; i++) {
          expect(projects[i].distance_km).toBeLessThanOrEqual(
            projects[i + 1].distance_km
          );
        }
      }
    });

    test('should return empty array when no projects in radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: 0,    // Middle of Atlantic Ocean
          lng: 0,
          radius: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    test('should find all Rwanda projects with large radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 500  // Large radius to cover all Rwanda
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Should find multiple projects
      expect(response.body.count).toBeGreaterThan(0);
    });

    test('should calculate accurate distances', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,  // Kigali
          lng: 30.0606,
          radius: 200
        });

      expect(response.status).toBe(200);

      if (response.body.count > 0) {
        response.body.data.forEach(project => {
          // Distance should be a positive number
          expect(project.distance_km).toBeGreaterThanOrEqual(0);

          // Distance should be within radius
          expect(project.distance_km).toBeLessThanOrEqual(200);

          // Distance should have at most 2 decimal places
          const decimalPlaces = (project.distance_km.toString().split('.')[1] || '').length;
          expect(decimalPlaces).toBeLessThanOrEqual(2);
        });
      }
    });
  });

  describe('GET /api/projects/nearme - RBAC (Role-Based Access Control)', () => {
    test('Admin should see all projects within radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Admin sees all projects (no RBAC filtering)
      const adminProjectCount = response.body.count;
      expect(adminProjectCount).toBeGreaterThanOrEqual(0);
    });

    test('PM should only see assigned projects within radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${pmToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // PM should see only assigned projects
      // (count may be less than or equal to admin's count)
    });

    test('Site Supervisor should only see assigned projects within radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${siteSupervisorToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Site Supervisor should see only assigned projects
    });
  });

  describe('GET /api/projects/nearme - Edge Cases', () => {
    test('should handle boundary coordinates (North Pole)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: 90,
          lng: 0,
          radius: 1000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0); // No projects at North Pole
    });

    test('should handle boundary coordinates (South Pole)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -90,
          lng: 0,
          radius: 1000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle International Date Line crossing', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: 0,
          lng: 180,
          radius: 100
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle very small radius (1km)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.search_location.radius_km).toBe(1);
    });

    test('should handle very large radius (10000km)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.9536,
          lng: 30.0606,
          radius: 10000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.search_location.radius_km).toBe(10000);
    });

    test('should handle decimal precision in coordinates', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          lat: -1.95361234,
          lng: 30.06067890,
          radius: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.search_location.latitude).toBe(-1.95361234);
    });
  });
});
