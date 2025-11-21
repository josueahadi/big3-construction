const express = require('express');
const { body } = require('express-validator');
const materialController = require('../controllers/material.controller');
const { requireAuth, adminOnly, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Material Routes
 *
 * All routes are prefixed with /api/materials
 */

/**
 * @route   GET /api/materials/stats
 * @desc    Get material statistics
 * @access  Private (Admin only)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/stats', requireAuth, adminOnly, materialController.getStatistics);

/**
 * @route   GET /api/materials/expensive
 * @desc    Get most expensive materials
 * @access  Private (Admin and PM)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/expensive', requireAuth, requireRole(['Admin', 'PM']), materialController.getMostExpensive);

/**
 * @route   GET /api/materials
 * @desc    Get all materials
 * @access  Private (All authenticated users)
 * @query   name - Filter by material name (partial match)
 * @query   min_cost - Filter by minimum unit cost
 * @query   max_cost - Filter by maximum unit cost
 * @query   sort_by - Sort field (material_id, material_name, unit_cost)
 * @query   sort_order - Sort order (asc, desc)
 */
router.get('/', requireAuth, materialController.getAll);

/**
 * @route   GET /api/materials/:id
 * @desc    Get material by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', requireAuth, materialController.getById);

/**
 * @route   POST /api/materials
 * @desc    Create a new material
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    requireAuth,
    adminOnly,
    body('material_name')
      .trim()
      .notEmpty()
      .withMessage('Material name is required')
      .isLength({ max: 100 })
      .withMessage('Material name must not exceed 100 characters'),
    body('unit_cost')
      .notEmpty()
      .withMessage('Unit cost is required')
      .isFloat({ min: 0, max: 99999999.99 })
      .withMessage('Unit cost must be between 0 and 99999999.99')
  ],
  materialController.create
);

/**
 * @route   PUT /api/materials/:id
 * @desc    Update material
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    requireAuth,
    adminOnly,
    body('material_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Material name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Material name must not exceed 100 characters'),
    body('unit_cost')
      .optional()
      .isFloat({ min: 0, max: 99999999.99 })
      .withMessage('Unit cost must be between 0 and 99999999.99')
  ],
  materialController.update
);

/**
 * @route   DELETE /api/materials/:id
 * @desc    Delete material
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, adminOnly, materialController.delete);

module.exports = router;
