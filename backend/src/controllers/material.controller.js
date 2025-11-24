const materialService = require('../services/material.service');
const { validationResult } = require('express-validator');

/**
 * Material Controller
 *
 * Handles HTTP requests for material-related operations
 */

class MaterialController {
  /**
   * Get all materials
   * @route GET /api/materials
   * @access Private (All authenticated users)
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        min_cost: req.query.min_cost ? parseFloat(req.query.min_cost) : undefined,
        max_cost: req.query.max_cost ? parseFloat(req.query.max_cost) : undefined,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };

      const materials = await materialService.getAllMaterials(filters);

      res.json({
        success: true,
        count: materials.length,
        data: materials
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get material by ID
   * @route GET /api/materials/:id
   * @access Private (All authenticated users)
   */
  async getById(req, res, next) {
    try {
      const materialId = parseInt(req.params.id);

      if (isNaN(materialId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid material ID'
        });
      }

      const material = await materialService.getMaterialById(materialId);

      res.json({
        success: true,
        data: material
      });
    } catch (error) {
      if (error.message === 'MATERIAL_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('materials.not_found') : 'Material not found'
        });
      }
      next(error);
    }
  }

  /**
   * Create new material
   * @route POST /api/materials
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

      const material = await materialService.createMaterial(req.body);

      res.status(201).json({
        success: true,
        message: req.t ? req.t('materials.created') : 'Material created successfully',
        data: material
      });
    } catch (error) {
      if (error.message === 'MATERIAL_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('materials.name_required') : 'Material name is required'
        });
      }
      if (error.message === 'UNIT_COST_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('materials.unit_cost_required') : 'Unit cost is required'
        });
      }
      if (error.message === 'MATERIAL_NAME_TOO_LONG') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('materials.name_too_long') : 'Material name must not exceed 100 characters'
        });
      }
      if (error.message === 'INVALID_UNIT_COST') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('materials.invalid_unit_cost') : 'Unit cost must be a positive number'
        });
      }
      if (error.message === 'UNIT_COST_TOO_HIGH') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('materials.unit_cost_too_high') : 'Unit cost exceeds maximum allowed value'
        });
      }
      next(error);
    }
  }

  /**
   * Update material
   * @route PUT /api/materials/:id
   * @access Private (Admin only)
   */
  async update(req, res, next) {
    try {
      const materialId = parseInt(req.params.id);

      if (isNaN(materialId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid material ID'
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

      const material = await materialService.updateMaterial(materialId, req.body);

      res.json({
        success: true,
        message: req.t ? req.t('materials.updated') : 'Material updated successfully',
        data: material
      });
    } catch (error) {
      if (error.message === 'MATERIAL_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('materials.not_found') : 'Material not found'
        });
      }
      if (error.message === 'MATERIAL_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: 'Material name cannot be empty'
        });
      }
      if (error.message === 'MATERIAL_NAME_TOO_LONG') {
        return res.status(400).json({
          success: false,
          error: 'Material name must not exceed 100 characters'
        });
      }
      if (error.message === 'INVALID_UNIT_COST') {
        return res.status(400).json({
          success: false,
          error: 'Unit cost must be a positive number'
        });
      }
      if (error.message === 'UNIT_COST_TOO_HIGH') {
        return res.status(400).json({
          success: false,
          error: 'Unit cost exceeds maximum allowed value'
        });
      }
      next(error);
    }
  }

  /**
   * Delete material
   * @route DELETE /api/materials/:id
   * @access Private (Admin only)
   */
  async delete(req, res, next) {
    try {
      const materialId = parseInt(req.params.id);

      if (isNaN(materialId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid material ID'
        });
      }

      await materialService.deleteMaterial(materialId);

      res.json({
        success: true,
        message: req.t ? req.t('materials.deleted') : 'Material deleted successfully'
      });
    } catch (error) {
      if (error.message === 'MATERIAL_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('materials.not_found') : 'Material not found'
        });
      }
      next(error);
    }
  }

  /**
   * Get material statistics
   * @route GET /api/materials/stats
   * @access Private (Admin only)
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await materialService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get most expensive materials
   * @route GET /api/materials/expensive
   * @access Private (Admin and PM)
   */
  async getMostExpensive(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
      }

      const materials = await materialService.getMostExpensive(limit);

      res.json({
        success: true,
        count: materials.length,
        data: materials
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaterialController();
