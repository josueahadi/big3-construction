const projectRepository = require('../repositories/project.repository');

/**
 * Project Service (Business Logic Layer)
 *
 * This module handles project-related business logic including
 * validation, data transformation, and orchestrating repository calls.
 */

class ProjectService {
  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of projects
   */
  async getAllProjects(filters = {}) {
    return projectRepository.findAll(filters);
  }

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project object
   */
  async getProjectById(projectId) {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  async createProject(projectData) {
    const { project_id, project_name, client_id } = projectData;

    // Validate required fields
    if (!project_id) {
      throw new Error('PROJECT_ID_REQUIRED');
    }

    if (!project_name) {
      throw new Error('PROJECT_NAME_REQUIRED');
    }

    // Check if project ID already exists
    const exists = await projectRepository.exists(project_id);
    if (exists) {
      throw new Error('PROJECT_ID_EXISTS');
    }

    // Validate project ID format (e.g., P001, P002)
    if (!/^P\d{3}$/.test(project_id)) {
      throw new Error('INVALID_PROJECT_ID_FORMAT');
    }

    // Validate dates if provided
    if (projectData.start_date && projectData.end_date) {
      const startDate = new Date(projectData.start_date);
      const endDate = new Date(projectData.end_date);

      if (endDate < startDate) {
        throw new Error('END_DATE_BEFORE_START_DATE');
      }
    }

    // Validate budget if provided
    if (projectData.budget && projectData.budget < 0) {
      throw new Error('INVALID_BUDGET');
    }

    // Validate coordinates if provided
    if (projectData.latitude && (projectData.latitude < -90 || projectData.latitude > 90)) {
      throw new Error('INVALID_LATITUDE');
    }

    if (projectData.longitude && (projectData.longitude < -180 || projectData.longitude > 180)) {
      throw new Error('INVALID_LONGITUDE');
    }

    return projectRepository.create(projectData);
  }

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(projectId, updates) {
    // Check if project exists
    const exists = await projectRepository.exists(projectId);
    if (!exists) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Validate dates if being updated
    if (updates.start_date && updates.end_date) {
      const startDate = new Date(updates.start_date);
      const endDate = new Date(updates.end_date);

      if (endDate < startDate) {
        throw new Error('END_DATE_BEFORE_START_DATE');
      }
    }

    // Validate budget if being updated
    if (updates.budget !== undefined && updates.budget < 0) {
      throw new Error('INVALID_BUDGET');
    }

    // Validate coordinates if being updated
    if (updates.latitude !== undefined && (updates.latitude < -90 || updates.latitude > 90)) {
      throw new Error('INVALID_LATITUDE');
    }

    if (updates.longitude !== undefined && (updates.longitude < -180 || updates.longitude > 180)) {
      throw new Error('INVALID_LONGITUDE');
    }

    // Don't allow updating project_id
    delete updates.project_id;

    return projectRepository.update(projectId, updates);
  }

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteProject(projectId) {
    // Check if project exists
    const exists = await projectRepository.exists(projectId);
    if (!exists) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return projectRepository.delete(projectId);
  }

  /**
   * Get projects by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Array>} Array of projects
   */
  async getProjectsByClient(clientId) {
    return projectRepository.findByClient(clientId);
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return projectRepository.getStatistics();
  }

  /**
   * Get project status
   * @param {Object} project - Project object
   * @returns {string} Status (ongoing, completed, upcoming, not_started)
   */
  getProjectStatus(project) {
    const now = new Date();
    const startDate = project.start_date ? new Date(project.start_date) : null;
    const endDate = project.end_date ? new Date(project.end_date) : null;

    if (!startDate) {
      return 'not_started';
    }

    if (startDate > now) {
      return 'upcoming';
    }

    if (endDate && endDate < now) {
      return 'completed';
    }

    return 'ongoing';
  }
}

module.exports = new ProjectService();
