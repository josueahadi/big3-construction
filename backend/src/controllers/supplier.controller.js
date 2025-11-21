const supplierService = require('../services/supplier.service');
const { validationResult } = require('express-validator');

/**
 * Supplier Controller
 *
 * Handles HTTP requests for supplier-related operations
 */

class SupplierController {
  /**
   * Get all suppliers
   * @route GET /api/suppliers
   * @access Private (All authenticated users)
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };

      const suppliers = await supplierService.getAllSuppliers(filters);

      res.json({
        success: true,
        count: suppliers.length,
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supplier by ID
   * @route GET /api/suppliers/:id
   * @access Private (All authenticated users)
   */
  async getById(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);

      if (isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid supplier ID'
        });
      }

      const supplier = await supplierService.getSupplierById(supplierId);

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      if (error.message === 'SUPPLIER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      next(error);
    }
  }

  /**
   * Create new supplier
   * @route POST /api/suppliers
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

      const supplier = await supplierService.createSupplier(req.body);

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier
      });
    } catch (error) {
      if (error.message === 'SUPPLIER_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: 'Supplier name is required'
        });
      }
      if (error.message === 'SUPPLIER_NAME_TOO_LONG') {
        return res.status(400).json({
          success: false,
          error: 'Supplier name must not exceed 100 characters'
        });
      }
      if (error.message === 'SUPPLIER_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'A supplier with this name already exists'
        });
      }
      if (error.message === 'INVALID_PHONE_FORMAT') {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }
      next(error);
    }
  }

  /**
   * Update supplier
   * @route PUT /api/suppliers/:id
   * @access Private (Admin only)
   */
  async update(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);

      if (isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid supplier ID'
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

      const supplier = await supplierService.updateSupplier(supplierId, req.body);

      res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier
      });
    } catch (error) {
      if (error.message === 'SUPPLIER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      if (error.message === 'SUPPLIER_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: 'Supplier name cannot be empty'
        });
      }
      if (error.message === 'SUPPLIER_NAME_TOO_LONG') {
        return res.status(400).json({
          success: false,
          error: 'Supplier name must not exceed 100 characters'
        });
      }
      if (error.message === 'SUPPLIER_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'A supplier with this name already exists'
        });
      }
      if (error.message === 'INVALID_PHONE_FORMAT') {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }
      next(error);
    }
  }

  /**
   * Delete supplier
   * @route DELETE /api/suppliers/:id
   * @access Private (Admin only)
   */
  async delete(req, res, next) {
    try {
      const supplierId = parseInt(req.params.id);

      if (isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid supplier ID'
        });
      }

      await supplierService.deleteSupplier(supplierId);

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      if (error.message === 'SUPPLIER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }
      if (error.message === 'SUPPLIER_HAS_SUPPLIES') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete supplier with existing material supplies. Remove supplies first.'
        });
      }
      next(error);
    }
  }

  /**
   * Get supplier statistics
   * @route GET /api/suppliers/stats
   * @access Private (Admin only)
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await supplierService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top suppliers
   * @route GET /api/suppliers/top
   * @access Private (Admin and PM)
   */
  async getTopSuppliers(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
      }

      const suppliers = await supplierService.getTopSuppliers(limit);

      res.json({
        success: true,
        count: suppliers.length,
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupplierController();
