const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Authentication Routes
 *
 * All routes are prefixed with /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('role')
      .isIn(['Admin', 'PM', 'Site Supervisor'])
      .withMessage('Role must be Admin, PM, or Site Supervisor'),
    body('worker_id')
      .optional()
      .isInt()
      .withMessage('Worker ID must be a number')
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires authentication)
 */
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 */
router.put(
  '/change-password',
  [
    requireAuth,
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('New password must contain at least one number')
  ],
  authController.changePassword
);

module.exports = router;
