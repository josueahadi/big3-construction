const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole, adminOnly } = require('../middleware/rbac.middleware');

const router = express.Router();

/**
 * Project Routes
 *
 * All routes are prefixed with /api/projects
 * All routes require authentication
 */

/**
 * @route   GET /api/projects/stats
 * @desc    Get project statistics
 * @access  Private (Admin only)
 * NOTE: This must come before /:id route to avoid conflict
 */
router.get('/stats', requireAuth, adminOnly, projectController.getStatistics);

/**
 * @route   GET /api/projects/client/:clientId
 * @desc    Get all projects for a specific client
 * @access  Private (All authenticated users)
 */
router.get('/client/:clientId', requireAuth, projectController.getByClient);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (with optional filters)
 * @access  Private (All authenticated users)
 * @query   city - Filter by city
 * @query   client_id - Filter by client
 * @query   status - Filter by status (ongoing, completed, upcoming)
 */
router.get('/', requireAuth, projectController.getAll);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', requireAuth, projectController.getById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    requireAuth,
    adminOnly,
    body('project_id')
      .notEmpty()
      .withMessage('Project ID is required')
      .matches(/^P\d{3}$/)
      .withMessage('Project ID must be in format P### (e.g., P001)'),
    body('project_name')
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Project name must be between 3 and 100 characters'),
    body('site_address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Site address must not exceed 200 characters'),
    body('site_city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('City name must not exceed 50 characters'),
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('client_id')
      .optional()
      .isInt()
      .withMessage('Client ID must be a number'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ],
  projectController.create
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Admin or PM)
 */
router.put(
  '/:id',
  [
    requireAuth,
    requireRole(['Admin', 'PM']),
    body('project_name')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Project name must be between 3 and 100 characters'),
    body('site_address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Site address must not exceed 200 characters'),
    body('site_city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('City name must not exceed 50 characters'),
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('client_id')
      .optional()
      .isInt()
      .withMessage('Client ID must be a number'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ],
  projectController.update
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, adminOnly, projectController.delete);

module.exports = router;
