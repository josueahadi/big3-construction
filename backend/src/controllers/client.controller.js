const clientService = require('../services/client.service');
const { validationResult } = require('express-validator');

/**
 * Client Controller
 *
 * Handles HTTP requests for client-related operations
 */

class ClientController {
  /**
   * Get all clients
   * @route GET /api/clients
   * @access Private (All authenticated users)
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };

      const clients = await clientService.getAllClients(filters);

      res.json({
        success: true,
        count: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client by ID
   * @route GET /api/clients/:id
   * @access Private (All authenticated users)
   */
  async getById(req, res, next) {
    try {
      const clientId = parseInt(req.params.id);

      if (isNaN(clientId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid client ID'
        });
      }

      const client = await clientService.getClientById(clientId);

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      if (error.message === 'CLIENT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('clients.not_found') : 'Client not found'
        });
      }
      next(error);
    }
  }

  /**
   * Create new client
   * @route POST /api/clients
   * @access Private (Admin only)
   */
  async create(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const client = await clientService.createClient(req.body);

      res.status(201).json({
        success: true,
        message: req.t ? req.t('clients.created') : 'Client created successfully',
        data: client
      });
    } catch (error) {
      if (error.message === 'CLIENT_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('clients.name_required') : 'Client name is required'
        });
      }
      if (error.message === 'CLIENT_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: req.t ? req.t('clients.name_exists') : 'A client with this name already exists'
        });
      }
      if (error.message === 'INVALID_PHONE_FORMAT') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('clients.invalid_phone') : 'Invalid phone number format'
        });
      }
      next(error);
    }
  }

  /**
   * Update client
   * @route PUT /api/clients/:id
   * @access Private (Admin only)
   */
  async update(req, res, next) {
    try {
      const clientId = parseInt(req.params.id);

      if (isNaN(clientId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid client ID'
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const client = await clientService.updateClient(clientId, req.body);

      res.json({
        success: true,
        message: req.t ? req.t('clients.updated') : 'Client updated successfully',
        data: client
      });
    } catch (error) {
      if (error.message === 'CLIENT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('clients.not_found') : 'Client not found'
        });
      }
      if (error.message === 'CLIENT_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'A client with this name already exists'
        });
      }
      next(error);
    }
  }

  /**
   * Delete client
   * @route DELETE /api/clients/:id
   * @access Private (Admin only)
   */
  async delete(req, res, next) {
    try {
      const clientId = parseInt(req.params.id);

      if (isNaN(clientId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid client ID'
        });
      }

      await clientService.deleteClient(clientId);

      res.json({
        success: true,
        message: req.t ? req.t('clients.deleted') : 'Client deleted successfully'
      });
    } catch (error) {
      if (error.message === 'CLIENT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('clients.not_found') : 'Client not found'
        });
      }
      if (error.message === 'CLIENT_HAS_PROJECTS') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('clients.has_projects') : 'Cannot delete client with existing projects. Delete or reassign projects first.'
        });
      }
      next(error);
    }
  }

  /**
   * Get client statistics
   * @route GET /api/clients/stats
   * @access Private (Admin only)
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await clientService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top clients
   * @route GET /api/clients/top
   * @access Private (Admin and PM)
   */
  async getTopClients(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
      }

      const clients = await clientService.getTopClients(limit);

      res.json({
        success: true,
        count: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();
