const projectService = require('../services/project.service');
const { validationResult } = require('express-validator');
const geospatialService = require('../services/geospatial.service');

/**
 * Project Controller
 *
 * This module handles HTTP requests/responses for project endpoints.
 * Controllers are thin - they delegate business logic to services.
 */

class ProjectController {
  /**
   * Get all projects
   * GET /api/projects
   * Query params: city, client_id, status
   */
  async getAll(req, res, next) {
    try {
      const { city, client_id, status } = req.query;

      const filters = {};
      if (city) filters.city = city;
      if (client_id) filters.client_id = parseInt(client_id);
      if (status) filters.status = status;

      const projects = await projectService.getAllProjects(filters);

      res.json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single project by ID
   * GET /api/projects/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const project = await projectService.getProjectById(id);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      next(error);
    }
  }

  /**
   * Create new project
   * POST /api/projects
   * (Admin only)
   */
  async create(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const projectData = req.body;

      const project = await projectService.createProject(projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      if (error.message === 'PROJECT_ID_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      if (error.message === 'PROJECT_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          error: 'Project name is required'
        });
      }

      if (error.message === 'PROJECT_ID_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'A project with this ID already exists'
        });
      }

      if (error.message === 'INVALID_PROJECT_ID_FORMAT') {
        return res.status(400).json({
          success: false,
          error: 'Project ID must be in format P### (e.g., P001, P002)'
        });
      }

      if (error.message === 'END_DATE_BEFORE_START_DATE') {
        return res.status(400).json({
          success: false,
          error: 'End date cannot be before start date'
        });
      }

      if (error.message === 'INVALID_BUDGET') {
        return res.status(400).json({
          success: false,
          error: 'Budget must be a positive number'
        });
      }

      if (error.message === 'INVALID_LATITUDE' || error.message === 'INVALID_LONGITUDE') {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180'
        });
      }

      next(error);
    }
  }

  /**
   * Update project
   * PUT /api/projects/:id
   * (Admin or PM)
   */
  async update(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const project = await projectService.updateProject(id, updates);

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      if (error.message === 'END_DATE_BEFORE_START_DATE') {
        return res.status(400).json({
          success: false,
          error: 'End date cannot be before start date'
        });
      }

      if (error.message === 'INVALID_BUDGET') {
        return res.status(400).json({
          success: false,
          error: 'Budget must be a positive number'
        });
      }

      if (error.message === 'INVALID_LATITUDE' || error.message === 'INVALID_LONGITUDE') {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180'
        });
      }

      next(error);
    }
  }

  /**
   * Delete project
   * DELETE /api/projects/:id
   * (Admin only)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await projectService.deleteProject(id);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      next(error);
    }
  }

  /**
   * Get project statistics
   * GET /api/projects/stats
   * (Admin only)
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await projectService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get projects by client
   * GET /api/projects/client/:clientId
   */
  async getByClient(req, res, next) {
    try {
      const { clientId } = req.params;

      const projects = await projectService.getProjectsByClient(parseInt(clientId));

      res.json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get projects near specified coordinates
   * @route GET /api/projects/nearme
   * @access Private
   * @param {number} req.query.lat - Latitude (-90 to 90)
   * @param {number} req.query.lng - Longitude (-180 to 180)  
   * @param {number} req.query.radius - Search radius in kilometers
   * @returns {object} Projects within radius sorted by distance
   */
  async getNearby(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;

      // Validate required parameters
      if (!lat || !lng || !radius) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('geo.missing_params') : 'Missing required parameters: lat, lng, radius'
        });
      }

      // Parse and validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = parseFloat(radius);

      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('geo.invalid_latitude') : 'Invalid latitude. Must be between -90 and 90'
        });
      }

      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false, 
          error: req.t ? req.t('geo.invalid_longitude') : 'Invalid longitude. Must be between -180 and 180'
        });
      }

      if (isNaN(searchRadius) || searchRadius <= 0) {
        return res.status(400).json({
          success: false,
          error: req.t ? req.t('geo.invalid_radius') : 'Invalid radius. Must be a positive number'
        });
      }

      // Get nearby projects
      const projects = await geospatialService.getProjectsNearLocation(
        latitude,
        longitude, 
        searchRadius,
        req.user
      );

      // Prepare response
      const response = {
        success: true,
        count: projects.length,
        search_location: {
          latitude,
          longitude, 
          radius_km: searchRadius
        },
        data: projects
      };

      // Add translated message if i18n is available
      if (req.t) {
        response.message = projects.length > 0 
          ? req.t('geo.search_success') 
          : req.t('geo.no_projects_found');
      }

      res.json(response);

    } catch (error) {
      console.error('Get nearby projects error:', error);
      
      if (error.message === 'DATABASE_ERROR') {
        return res.status(500).json({
          success: false,
          error: req.t ? req.t('errors.database_error') : 'Database error occurred'
        });
      }
      
      next(error);
    }
  }
}

module.exports = new ProjectController();