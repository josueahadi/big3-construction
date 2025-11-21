const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplier.controller');
const { requireAuth, adminOnly, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Supplier Routes
 *
 * All routes are prefixed with /api/suppliers
 */

/**
 * @route   GET /api/suppliers/stats
 * @desc    Get supplier statistics
 * @access  Private (Admin only)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/stats', requireAuth, adminOnly, supplierController.getStatistics);

/**
 * @route   GET /api/suppliers/top
 * @desc    Get top suppliers by supply value
 * @access  Private (Admin and PM)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/top', requireAuth, requireRole(['Admin', 'PM']), supplierController.getTopSuppliers);

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers
 * @access  Private (All authenticated users)
 * @query   name - Filter by supplier name (partial match)
 * @query   sort_by - Sort field (supplier_id, supplier_name)
 * @query   sort_order - Sort order (asc, desc)
 */
router.get('/', requireAuth, supplierController.getAll);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get supplier by ID with material supplies
 * @access  Private (All authenticated users)
 */
router.get('/:id', requireAuth, supplierController.getById);

/**
 * @route   POST /api/suppliers
 * @desc    Create a new supplier
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    requireAuth,
    adminOnly,
    body('supplier_name')
      .trim()
      .notEmpty()
      .withMessage('Supplier name is required')
      .isLength({ max: 100 })
      .withMessage('Supplier name must not exceed 100 characters'),
    body('supplier_phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters')
  ],
  supplierController.create
);

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    requireAuth,
    adminOnly,
    body('supplier_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Supplier name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Supplier name must not exceed 100 characters'),
    body('supplier_phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters')
  ],
  supplierController.update
);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete supplier
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, adminOnly, supplierController.delete);

module.exports = router;
