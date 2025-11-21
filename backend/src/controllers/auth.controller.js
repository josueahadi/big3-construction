const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

/**
 * Authentication Controller
 *
 * This module handles HTTP requests/responses for authentication endpoints.
 * Controllers are thin - they delegate business logic to services.
 */

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, role, worker_id } = req.body;

      // Call auth service
      const result = await authService.register({
        email,
        password,
        role,
        worker_id
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (error.message === 'USER_EXISTS') {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      if (error.message === 'INVALID_ROLE') {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be Admin, PM, or Site Supervisor'
        });
      }

      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Call auth service
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      next(error);
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   * (Requires authentication)
   */
  async getCurrentUser(req, res, next) {
    try {
      // req.user is populated by Passport middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      res.json({
        success: true,
        data: {
          id: req.user.user_id,
          email: req.user.email,
          role: req.user.role,
          preferred_language: req.user.preferred_language,
          worker_id: req.user.worker_id
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   * (Requires authentication)
   */
  async changePassword(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.user_id;

      await authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      next(error);
    }
  }
}

module.exports = new AuthController();
