const { pool } = require('../config/database');

/**
 * Project Repository (Data Access Layer)
 *
 * This module handles all database operations related to projects.
 * Following the Repository pattern, all SQL queries are isolated here.
 */

class ProjectRepository {
  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Optional filters (city, client_id, status)
   * @returns {Promise<Array>} Array of project objects
   */
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT
          p.project_id,
          p.project_name,
          p.site_address,
          p.site_city,
          p.start_date,
          p.end_date,
          p.budget,
          p.client_id,
          p.latitude,
          p.longitude,
          c.client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters
      if (filters.city) {
        query += ' AND p.site_city = ?';
        params.push(filters.city);
      }

      if (filters.client_id) {
        query += ' AND p.client_id = ?';
        params.push(filters.client_id);
      }

      // Check if project is ongoing, completed, or upcoming
      if (filters.status === 'ongoing') {
        query += ' AND p.start_date <= CURDATE() AND (p.end_date IS NULL OR p.end_date >= CURDATE())';
      } else if (filters.status === 'completed') {
        query += ' AND p.end_date < CURDATE()';
      } else if (filters.status === 'upcoming') {
        query += ' AND p.start_date > CURDATE()';
      }

      query += ' ORDER BY p.start_date DESC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding all projects:', error);
      throw error;
    }
  }

  /**
   * Find project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object|null>} Project object or null
   */
  async findById(projectId) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          p.project_id,
          p.project_name,
          p.site_address,
          p.site_city,
          p.start_date,
          p.end_date,
          p.budget,
          p.client_id,
          p.latitude,
          p.longitude,
          c.client_name,
          c.client_phone,
          c.client_phone as phone
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.client_id
        WHERE p.project_id = ?`,
        [projectId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding project by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project object
   */
  async create(projectData) {
    try {
      const {
        project_id,
        project_name,
        site_address,
        site_city,
        start_date,
        end_date,
        budget,
        client_id,
        latitude,
        longitude
      } = projectData;

      await pool.execute(
        `INSERT INTO projects (
          project_id, project_name, site_address, site_city,
          start_date, end_date, budget, client_id, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          project_name,
          site_address || null,
          site_city || null,
          start_date || null,
          end_date || null,
          budget || null,
          client_id || null,
          latitude || null,
          longitude || null
        ]
      );

      return this.findById(project_id);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated project object
   */
  async update(projectId, updates) {
    try {
      const allowedFields = [
        'project_name', 'site_address', 'site_city',
        'start_date', 'end_date', 'budget', 'client_id',
        'latitude', 'longitude'
      ];
      const fields = [];
      const values = [];

      // Build dynamic UPDATE query
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(projectId);

      await pool.execute(
        `UPDATE projects SET ${fields.join(', ')} WHERE project_id = ?`,
        values
      );

      return this.findById(projectId);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(projectId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM projects WHERE project_id = ?',
        [projectId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Check if project ID exists
   * @param {string} projectId - Project ID to check
   * @returns {Promise<boolean>} True if exists
   */
  async exists(projectId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM projects WHERE project_id = ?',
        [projectId]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking project existence:', error);
      throw error;
    }
  }

  /**
   * Get projects by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Array>} Array of projects
   */
  async findByClient(clientId) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          project_id, project_name, site_address, site_city,
          start_date, end_date, budget, latitude, longitude
        FROM projects
        WHERE client_id = ?
        ORDER BY start_date DESC`,
        [clientId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding projects by client:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(*) as total_projects,
          SUM(CASE WHEN start_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE()) THEN 1 ELSE 0 END) as ongoing,
          SUM(CASE WHEN end_date < CURDATE() THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN start_date > CURDATE() THEN 1 ELSE 0 END) as upcoming,
          SUM(budget) as total_budget,
          AVG(budget) as average_budget
        FROM projects
      `);
      return rows[0];
    } catch (error) {
      console.error('Error getting project statistics:', error);
      throw error;
    }
  }
}

module.exports = new ProjectRepository();