const express = require('express');
const { body } = require('express-validator');
const workerController = require('../controllers/worker.controller');
const { requireAuth, adminOnly, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Worker Routes
 *
 * All routes are prefixed with /api/workers
 */

/**
 * @route   GET /api/workers/stats
 * @desc    Get worker statistics
 * @access  Private (Admin only)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/stats', requireAuth, adminOnly, workerController.getStatistics);

/**
 * @route   GET /api/workers/expiring-certs
 * @desc    Get workers with expiring certifications
 * @access  Private (Admin and PM)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/expiring-certs', requireAuth, requireRole(['Admin', 'PM']), workerController.getExpiringCerts);

/**
 * @route   GET /api/workers
 * @desc    Get all workers
 * @access  Private (All authenticated users)
 * @query   name - Filter by name (partial match)
 * @query   min_salary - Minimum salary filter
 * @query   max_salary - Maximum salary filter
 * @query   sort_by - Sort field (worker_id, first_name, last_name, salary)
 * @query   sort_order - Sort order (asc, desc)
 */
router.get('/', requireAuth, workerController.getAll);

/**
 * @route   GET /api/workers/:id
 * @desc    Get worker by ID with certifications and assignments
 * @access  Private (All authenticated users)
 */
router.get('/:id', requireAuth, workerController.getById);

/**
 * @route   POST /api/workers
 * @desc    Create a new worker
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    requireAuth,
    adminOnly,
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 100 })
      .withMessage('First name must not exceed 100 characters'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 100 })
      .withMessage('Last name must not exceed 100 characters'),
    body('phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number')
      .custom((value) => value >= 0)
      .withMessage('Salary must be a positive number')
  ],
  workerController.create
);

/**
 * @route   PUT /api/workers/:id
 * @desc    Update worker
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    requireAuth,
    adminOnly,
    body('first_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('First name must not exceed 100 characters'),
    body('last_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Last name must not exceed 100 characters'),
    body('phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number')
      .custom((value) => value >= 0)
      .withMessage('Salary must be a positive number')
  ],
  workerController.update
);

/**
 * @route   DELETE /api/workers/:id
 * @desc    Delete worker
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, adminOnly, workerController.delete);

/**
 * @route   POST /api/workers/:id/certifications
 * @desc    Add certification to worker
 * @access  Private (Admin only)
 */
router.post(
  '/:id/certifications',
  [
    requireAuth,
    adminOnly,
    body('cert_name')
      .trim()
      .notEmpty()
      .withMessage('Certification name is required')
      .isLength({ max: 100 })
      .withMessage('Certification name must not exceed 100 characters'),
    body('expiry_date')
      .optional()
      .isISO8601()
      .withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
  ],
  workerController.addCertification
);

/**
 * @route   PUT /api/workers/certifications/:certId
 * @desc    Update certification
 * @access  Private (Admin only)
 */
router.put(
  '/certifications/:certId',
  [
    requireAuth,
    adminOnly,
    body('cert_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Certification name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Certification name must not exceed 100 characters'),
    body('expiry_date')
      .optional()
      .isISO8601()
      .withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
  ],
  workerController.updateCertification
);

/**
 * @route   DELETE /api/workers/certifications/:certId
 * @desc    Delete certification
 * @access  Private (Admin only)
 */
router.delete('/certifications/:certId', requireAuth, adminOnly, workerController.deleteCertification);

module.exports = router;
