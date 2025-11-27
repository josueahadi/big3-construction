const request = require('supertest');
const app = require('../../src/app');
const workerService = require('../../src/services/worker.service');

jest.mock('../../src/services/worker.service');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { user_id: 1, role: 'Admin' };
    next();
  }
}));

describe('Worker Controller - i18n Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/workers', () => {
    it('should return English error messages by default', async () => {
      workerService.createWorker.mockRejectedValue({
        message: 'FIRST_NAME_REQUIRED'
      });

      const res = await request(app)
        .post('/api/workers')
        .send({ last_name: 'Doe' });

      // TODO: Verify response contains English error message
      expect(res.body.error).toBe('First name is required');
    });

    it('should return Spanish error messages when Accept-Language is es', async () => {
      workerService.createWorker.mockRejectedValue({
        message: 'FIRST_NAME_REQUIRED'
      });

      const res = await request(app)
        .post('/api/workers')
        .set('Accept-Language', 'es')
        .send({ last_name: 'Doe' });

      // TODO: Verify response contains Spanish error message
      expect(res.body.error).toBe('Se requiere el nombre');
    });

    it('should handle successful creation with i18n', async () => {
      const mockWorker = { worker_id: 1, first_name: 'John', last_name: 'Doe' };
      workerService.createWorker.mockResolvedValue(mockWorker);

      // TODO: Test success message in both languages
    });
  });

  describe('POST /api/workers/:id/certifications', () => {
    it('should translate certification error messages', async () => {
      // TODO: Test CERT_NAME_REQUIRED error in both languages
    });

    it('should translate certification success messages', async () => {
      // TODO: Test success message in both languages
    });
  });

  // TODO: Add similar tests for:
  // - Client controller
  // - Material controller
  // - Supplier controller
});