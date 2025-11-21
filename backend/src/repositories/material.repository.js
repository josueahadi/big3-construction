const { pool } = require('../config/database');

/**
 * Material Repository (Data Access Layer)
 *
 * Handles all database operations for materials.
 */

class MaterialRepository {
  /**
   * Get all materials with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of materials
   */
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT
          material_id,
          material_name,
          unit_cost
        FROM materials
        WHERE 1=1
      `;
      const params = [];

      // Filter by name
      if (filters.name) {
        query += ` AND material_name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      // Filter by minimum cost
      if (filters.min_cost) {
        query += ` AND unit_cost >= ?`;
        params.push(filters.min_cost);
      }

      // Filter by maximum cost
      if (filters.max_cost) {
        query += ` AND unit_cost <= ?`;
        params.push(filters.max_cost);
      }

      // Sorting
      const sortBy = filters.sort_by || 'material_id';
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding all materials:', error);
      throw error;
    }
  }

  /**
   * Get material by ID
   * @param {number} materialId - Material ID
   * @returns {Promise<Object|null>} Material object
   */
  async findById(materialId) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          material_id,
          material_name,
          unit_cost
        FROM materials
        WHERE material_id = ?`,
        [materialId]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Error finding material by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new material
   * @param {Object} materialData - Material data
   * @returns {Promise<Object>} Created material
   */
  async create(materialData) {
    try {
      const { material_name, unit_cost } = materialData;

      const [result] = await pool.execute(
        `INSERT INTO materials (material_name, unit_cost)
        VALUES (?, ?)`,
        [material_name, unit_cost]
      );

      const materialId = result.insertId;

      // Return the created material
      return this.findById(materialId);
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Update material
   * @param {number} materialId - Material ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated material
   */
  async update(materialId, updates) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      if (updates.material_name !== undefined) {
        fields.push('material_name = ?');
        values.push(updates.material_name);
      }
      if (updates.unit_cost !== undefined) {
        fields.push('unit_cost = ?');
        values.push(updates.unit_cost);
      }

      if (fields.length === 0) {
        return this.findById(materialId);
      }

      values.push(materialId);

      await pool.execute(
        `UPDATE materials SET ${fields.join(', ')} WHERE material_id = ?`,
        values
      );

      return this.findById(materialId);
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  /**
   * Delete material
   * @param {number} materialId - Material ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(materialId) {
    try {
      await pool.execute(
        'DELETE FROM materials WHERE material_id = ?',
        [materialId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  /**
   * Check if material exists
   * @param {number} materialId - Material ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(materialId) {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM materials WHERE material_id = ? LIMIT 1',
        [materialId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking material existence:', error);
      throw error;
    }
  }

  /**
   * Get material statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(*) as total_materials,
          AVG(unit_cost) as average_cost,
          MIN(unit_cost) as min_cost,
          MAX(unit_cost) as max_cost
        FROM materials
      `);

      return rows[0];
    } catch (error) {
      console.error('Error getting material statistics:', error);
      throw error;
    }
  }

  /**
   * Get most expensive materials
   * @param {number} limit - Number of materials to return
   * @returns {Promise<Array>} Most expensive materials
   */
  async getMostExpensive(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          material_id,
          material_name,
          unit_cost
        FROM materials
        ORDER BY unit_cost DESC
        LIMIT ${parseInt(limit)}`
      );

      return rows;
    } catch (error) {
      console.error('Error getting most expensive materials:', error);
      throw error;
    }
  }
}

module.exports = new MaterialRepository();
