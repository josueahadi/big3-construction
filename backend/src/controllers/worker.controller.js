const workerService = require('../services/worker.service');
const { validationResult } = require('express-validator');

/**
 * Worker Controller
 *
 * Handles HTTP requests for worker-related operations
 */

class WorkerController {
  /**
   * Get all workers
   * @route GET /api/workers
   * @access Private (All authenticated users)
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        min_salary: req.query.min_salary ? parseFloat(req.query.min_salary) : undefined,
        max_salary: req.query.max_salary ? parseFloat(req.query.max_salary) : undefined,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };

      const workers = await workerService.getAllWorkers(filters);

      res.json({
        success: true,
        count: workers.length,
        data: workers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker by ID
   * @route GET /api/workers/:id
   * @access Private (All authenticated users)
   */
  async getById(req, res, next) {
    try {
      const workerId = parseInt(req.params.id);

      if (isNaN(workerId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid worker ID'
        });
      }

      const worker = await workerService.getWorkerById(workerId);

      res.json({
        success: true,
        data: worker
      });
    } catch (error) {
      if (error.message === 'WORKER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('workers.not_found') : 'Worker not found'
        });
      }
      next(error);
    }
  }

  /**
   * Create new worker
   * @route POST /api/workers
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

      const worker = await workerService.createWorker(req.body);

      res.status(201).json({
        success: true,
        message: req.t ? req.t('workers.created') : 'Worker created successfully',
        data: worker
      });
    } catch (error) {
      if (error.message === 'FIRST_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.first_name_required') : 'First name is required'
        });
      }
      if (error.message === 'LAST_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.last_name_required') : 'Last name is required'
        });
      }
      if (error.message === 'INVALID_SALARY') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.invalid_salary') : 'Salary must be a positive number'
        });
      }
      if (error.message === 'INVALID_PHONE_FORMAT') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.invalid_phone') : 'Invalid phone number format'
        });
      }
      next(error);
    }
  }

  /**
   * Update worker
   * @route PUT /api/workers/:id
   * @access Private (Admin only)
   */
  async update(req, res, next) {
    try {
      const workerId = parseInt(req.params.id);

      if (isNaN(workerId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid worker ID'
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

      const worker = await workerService.updateWorker(workerId, req.body);

      res.json({
        success: true,
        message: req.t ? req.t('workers.updated') : 'Worker updated successfully',
        data: worker
      });
    } catch (error) {
      if (error.message === 'WORKER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('workers.not_found') : 'Worker not found'
        });
      }
      if (error.message === 'INVALID_SALARY') {
        return res.status(400).json({
          success: false,
          error: 'Salary must be a positive number'
        });
      }
      next(error);
    }
  }

  /**
   * Delete worker
   * @route DELETE /api/workers/:id
   * @access Private (Admin only)
   */
  async delete(req, res, next) {
    try {
      const workerId = parseInt(req.params.id);

      if (isNaN(workerId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid worker ID'
        });
      }

      await workerService.deleteWorker(workerId);

      res.json({
        success: true,
        message: req.t ? req.t('workers.deleted') : 'Worker deleted successfully'
      });
    } catch (error) {
      if (error.message === 'WORKER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('workers.not_found') : 'Worker not found'
        });
      }
      next(error);
    }
  }

  /**
   * Add certification to worker
   * @route POST /api/workers/:id/certifications
   * @access Private (Admin only)
   */
  async addCertification(req, res, next) {
    try {
      const workerId = parseInt(req.params.id);

      if (isNaN(workerId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid worker ID'
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

      const certification = await workerService.addCertification(workerId, req.body);

      res.status(201).json({
        success: true,
        message: req.t ? req.t('workers.certification_added') : 'Certification added successfully',
        data: certification
      });
    } catch (error) {
      if (error.message === 'WORKER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: req.t ? req.t('workers.not_found') : 'Worker not found'
        });
      }
      if (error.message === 'CERT_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.cert_name_required') : 'Certification name is required'
        });
      }
      if (error.message === 'INVALID_EXPIRY_DATE') {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('workers.invalid_expiry_date') : 'Invalid expiry date format'
        });
      }
      next(error);
    }
  }

  /**
   * Update certification
   * @route PUT /api/workers/certifications/:certId
   * @access Private (Admin only)
   */
  async updateCertification(req, res, next) {
    try {
      const certId = parseInt(req.params.certId);

      if (isNaN(certId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid certification ID'
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

      const certification = await workerService.updateCertification(certId, req.body);

      res.json({
        success: true,
        message: req.t ? req.t('workers.certification_updated') : 'Certification updated successfully',
        data: certification
      });
    } catch (error) {
      if (error.message === 'INVALID_EXPIRY_DATE') {
        return res.status(400).json({
          success: false,
          error: 'Invalid expiry date format'
        });
      }
      next(error);
    }
  }

  /**
   * Delete certification
   * @route DELETE /api/workers/certifications/:certId
   * @access Private (Admin only)
   */
  async deleteCertification(req, res, next) {
    try {
      const certId = parseInt(req.params.certId);

      if (isNaN(certId)) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('common.invalid_id') : 'Invalid certification ID'
        });
      }

      await workerService.deleteCertification(certId);

      res.json({
        success: true,
        message: req.t ? req.t('workers.certification_deleted') : 'Certification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workers with expiring certifications
   * @route GET /api/workers/expiring-certs
   * @access Private (Admin and PM)
   */
  async getExpiringCerts(req, res, next) {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;

      if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({
          success: false,
          error: 'Days must be between 1 and 365'
        });
      }

      const workers = await workerService.getWorkersWithExpiringCerts(days);

      res.json({
        success: true,
        count: workers.length,
        data: workers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker statistics
   * @route GET /api/workers/stats
   * @access Private (Admin only)
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await workerService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkerController();
