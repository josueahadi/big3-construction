/**
 * Auth Controller Tests
 * Tests for user registration and login endpoints
 */

const authService = require('../../src/services/auth.service');
const authController = require('../../src/controllers/auth.controller');
const { 
  createMockRequest, 
  createMockResponse, 
  createMockNext,
  generateToken 
} = require('../fixtures/test-helpers');
const { 
  testUsers, 
  registrationData, 
  loginData 
} = require('../fixtures/test-data');

// Mock the auth service
jest.mock('../../src/services/auth.service');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user with valid data', async () => {
      const userData = registrationData.validAdmin;
      
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

    it('should handle registration errors', async () => {
      req.body = registrationData.validAdmin;
      
      authService.register.mockRejectedValue(new Error('DATABASE_ERROR'));

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject duplicate email registration', async () => {
      req.body = registrationData.validAdmin;
      
      authService.register.mockRejectedValue(new Error('USER_EXISTS'));

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      req.body = loginData.valid;
      
      authService.login.mockResolvedValue({
        user_id: 1,
        email: testUsers.admin.email,
        role: testUsers.admin.role,
        token: generateToken({ user_id: 1, role: 'Admin' })
      });

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalled();
    });

    it('should reject login with invalid credentials', async () => {
      req.body = loginData.invalidPassword;
      
      authService.login.mockRejectedValue(new Error('INVALID_PASSWORD'));

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject login for non-existent user', async () => {
      req.body = loginData.invalidEmail;
      
      authService.login.mockRejectedValue(new Error('USER_NOT_FOUND'));

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors during login', async () => {
      req.body = loginData.valid;
      
      authService.login.mockRejectedValue(new Error('DATABASE_ERROR'));

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
