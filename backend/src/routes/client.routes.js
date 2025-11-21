const express = require('express');
const { body } = require('express-validator');
const clientController = require('../controllers/client.controller');
const { requireAuth, adminOnly, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Client Routes
 *
 * All routes are prefixed with /api/clients
 */

/**
 * @route   GET /api/clients/stats
 * @desc    Get client statistics
 * @access  Private (Admin only)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/stats', requireAuth, adminOnly, clientController.getStatistics);

/**
 * @route   GET /api/clients/top
 * @desc    Get top clients by project count
 * @access  Private (Admin and PM)
 * @note    Must be before /:id to avoid route conflicts
 */
router.get('/top', requireAuth, requireRole(['Admin', 'PM']), clientController.getTopClients);

/**
 * @route   GET /api/clients
 * @desc    Get all clients
 * @access  Private (All authenticated users)
 * @query   name - Filter by client name (partial match)
 * @query   sort_by - Sort field (client_id, client_name)
 * @query   sort_order - Sort order (asc, desc)
 */
router.get('/', requireAuth, clientController.getAll);

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID with projects
 * @access  Private (All authenticated users)
 */
router.get('/:id', requireAuth, clientController.getById);

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    requireAuth,
    adminOnly,
    body('client_name')
      .trim()
      .notEmpty()
      .withMessage('Client name is required')
      .isLength({ max: 100 })
      .withMessage('Client name must not exceed 100 characters'),
    body('client_phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters')
  ],
  clientController.create
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    requireAuth,
    adminOnly,
    body('client_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Client name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Client name must not exceed 100 characters'),
    body('client_phone')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone must not exceed 20 characters')
  ],
  clientController.update
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, adminOnly, clientController.delete);

module.exports = router;
