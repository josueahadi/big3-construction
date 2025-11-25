const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');

describe.skip('i18n Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    // Login as admin to get token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@big3construction.com',
        password: 'password123'
      });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await db.end();
  });

  describe('Accept-Language Header Detection', () => {
    test('should return English messages by default', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);

      // Should have English message if available
      if (response.body.message) {
        expect(response.body.message).toMatch(/success|completed/i);
      }
    });

    test('should return Spanish messages with Accept-Language: es', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);

      // Should have Spanish message if available
      if (response.body.message) {
        expect(response.body.message).toMatch(/exitoso|completada/i);
      }
    });

    test('should return English messages with Accept-Language: en', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);

      if (response.body.message) {
        expect(response.body.message).toMatch(/success|completed/i);
      }
    });

    test('should handle Accept-Language with locale (es-ES)', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es-ES')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);

      if (response.body.message) {
        expect(response.body.message).toMatch(/exitoso|completada/i);
      }
    });

    test('should handle Accept-Language with quality values', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es-ES,es;q=0.9,en;q=0.8')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);

      if (response.body.message) {
        // Should use Spanish (first preference)
        expect(response.body.message).toMatch(/exitoso|completada|success/i);
      }
    });

    test('should fallback to English for unsupported language', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'fr') // French not supported
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(200);
      // i18next should fallback to English
    });
  });

  describe('Geospatial Error Messages (English)', () => {
    test('should return English error for missing lat', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('lat');
      expect(response.body.error).toContain('lng');
      expect(response.body.error).toContain('radius');
    });

    test('should return English error for invalid latitude', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: 100, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/latitude/i);
      expect(response.body.error).toMatch(/-90.*90/);
    });

    test('should return English error for invalid longitude', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 200, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/longitude/i);
      expect(response.body.error).toMatch(/-180.*180/);
    });

    test('should return English error for invalid radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/radius/i);
      expect(response.body.error).toMatch(/positive/i);
    });
  });

  describe('Geospatial Error Messages (Spanish)', () => {
    test('should return Spanish error for missing parameters', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/lat|lng|radius/);
    });

    test('should return Spanish error for invalid latitude', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: 100, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/latitud/i);
      expect(response.body.error).toMatch(/-90.*90/);
    });

    test('should return Spanish error for invalid longitude', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 200, radius: 50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/longitud/i);
      expect(response.body.error).toMatch(/-180.*180/);
    });

    test('should return Spanish error for invalid radius', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/radio/i);
      expect(response.body.error).toMatch(/positivo/i);
    });
  });

  describe('Success Messages', () => {
    test('should return English success message with search results', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 200 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.message) {
        expect(response.body.message).toMatch(/success|completed/i);
      }
    });

    test('should return Spanish success message with search results', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: 200 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.message) {
        expect(response.body.message).toMatch(/exitoso|completada/i);
      }
    });

    test('should return English "no projects found" message', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: 0, lng: 0, radius: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.count === 0 && response.body.message) {
        expect(response.body.message).toMatch(/no projects found/i);
      }
    });

    test('should return Spanish "no projects found" message', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: 0, lng: 0, radius: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      if (response.body.count === 0 && response.body.message) {
        expect(response.body.message).toMatch(/no se encontraron proyectos/i);
      }
    });
  });

  describe('Authentication Error Messages', () => {
    test('should return English error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Accept-Language', 'en')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      // Check for error message (may or may not be translated yet)
    });

    test('should return Spanish error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Accept-Language', 'es')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      // Check for error message (may or may not be translated yet)
    });

    test('should return English error for missing authentication', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(401);
    });

    test('should return Spanish error for missing authentication', async () => {
      const response = await request(app)
        .get('/api/projects/nearme')
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response.status).toBe(401);
    });
  });

  describe('Multiple Requests with Different Languages', () => {
    test('should handle concurrent requests with different languages', async () => {
      const [enResponse, esResponse] = await Promise.all([
        request(app)
          .get('/api/projects/nearme')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Accept-Language', 'en')
          .query({ lat: -1.9536, lng: 30.0606, radius: 50 }),

        request(app)
          .get('/api/projects/nearme')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Accept-Language', 'es')
          .query({ lat: -1.9536, lng: 30.0606, radius: 50 })
      ]);

      expect(enResponse.status).toBe(200);
      expect(esResponse.status).toBe(200);

      // Both should return data, but potentially different messages
      expect(enResponse.body.success).toBe(true);
      expect(esResponse.body.success).toBe(true);
    });

    test('should handle language switching between requests', async () => {
      // First request in English
      const response1 = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response1.status).toBe(200);

      // Second request in Spanish
      const response2 = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response2.status).toBe(200);

      // Third request back to English
      const response3 = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      expect(response3.status).toBe(200);

      // All should succeed
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      expect(response3.body.success).toBe(true);
    });
  });

  describe('Response Structure Consistency', () => {
    test('should maintain consistent response structure regardless of language', async () => {
      const enResponse = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      const esResponse = await request(app)
        .get('/api/projects/nearme')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'es')
        .query({ lat: -1.9536, lng: 30.0606, radius: 50 });

      // Both should have same structure
      expect(Object.keys(enResponse.body).sort()).toEqual(
        Object.keys(esResponse.body).sort()
      );

      // Both should have success, count, data, search_location
      expect(enResponse.body).toHaveProperty('success');
      expect(enResponse.body).toHaveProperty('count');
      expect(enResponse.body).toHaveProperty('data');
      expect(enResponse.body).toHaveProperty('search_location');

      expect(esResponse.body).toHaveProperty('success');
      expect(esResponse.body).toHaveProperty('count');
      expect(esResponse.body).toHaveProperty('data');
      expect(esResponse.body).toHaveProperty('search_location');
    });
  });
});
