const { pool } = require('../config/database');

/**
 * Client Repository (Data Access Layer)
 *
 * Handles all database operations for clients including
 * their associated projects.
 */

class ClientRepository {
  /**
   * Get all clients with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of clients
   */
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT
          c.client_id,
          c.client_name,
          c.client_phone,
          COUNT(DISTINCT p.project_id) as project_count
        FROM clients c
        LEFT JOIN projects p ON c.client_id = p.client_id
        WHERE 1=1
      `;
      const params = [];

      // Filter by name
      if (filters.name) {
        query += ` AND c.client_name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      query += ` GROUP BY c.client_id, c.client_name, c.client_phone`;

      // Sorting
      const sortBy = filters.sort_by || 'client_id';
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding all clients:', error);
      throw error;
    }
  }

  /**
   * Get client by ID with projects
   * @param {number} clientId - Client ID
   * @returns {Promise<Object|null>} Client object with details
   */
  async findById(clientId) {
    try {
      // Get client basic info
      const [clientRows] = await pool.execute(
        `SELECT
          client_id,
          client_name,
          client_phone
        FROM clients
        WHERE client_id = ?`,
        [clientId]
      );

      if (clientRows.length === 0) {
        return null;
      }

      const client = clientRows[0];

      // Get projects for this client
      const [projectRows] = await pool.execute(
        `SELECT
          project_id,
          project_name,
          site_address,
          site_city,
          start_date,
          end_date,
          budget
        FROM projects
        WHERE client_id = ?
        ORDER BY start_date DESC`,
        [clientId]
      );

      return {
        ...client,
        projects: projectRows
      };
    } catch (error) {
      console.error('Error finding client by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client
   */
  async create(clientData) {
    try {
      const { client_name, client_phone } = clientData;

      const [result] = await pool.execute(
        `INSERT INTO clients (client_name, client_phone)
        VALUES (?, ?)`,
        [client_name, client_phone || null]
      );

      const clientId = result.insertId;

      // Return the created client
      return this.findById(clientId);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Update client
   * @param {number} clientId - Client ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated client
   */
  async update(clientId, updates) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      if (updates.client_name !== undefined) {
        fields.push('client_name = ?');
        values.push(updates.client_name);
      }
      if (updates.client_phone !== undefined) {
        fields.push('client_phone = ?');
        values.push(updates.client_phone);
      }

      if (fields.length === 0) {
        return this.findById(clientId);
      }

      values.push(clientId);

      await pool.execute(
        `UPDATE clients SET ${fields.join(', ')} WHERE client_id = ?`,
        values
      );

      return this.findById(clientId);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Delete client
   * @param {number} clientId - Client ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(clientId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Note: Due to foreign key constraints, this will fail if client has projects
      // We keep this behavior to prevent accidental data loss
      await connection.execute(
        'DELETE FROM clients WHERE client_id = ?',
        [clientId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting client:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if client exists
   * @param {number} clientId - Client ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(clientId) {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM clients WHERE client_id = ? LIMIT 1',
        [clientId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking client existence:', error);
      throw error;
    }
  }

  /**
   * Check if client name exists
   * @param {string} clientName - Client name
   * @param {number} excludeId - Client ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async nameExists(clientName, excludeId = null) {
    try {
      let query = 'SELECT 1 FROM clients WHERE client_name = ?';
      const params = [clientName];

      if (excludeId) {
        query += ' AND client_id != ?';
        params.push(excludeId);
      }

      const [rows] = await pool.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking client name existence:', error);
      throw error;
    }
  }

  /**
   * Get client statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(DISTINCT c.client_id) as total_clients,
          COUNT(DISTINCT p.project_id) as total_projects,
          SUM(p.budget) as total_budget,
          AVG(p.budget) as average_project_budget
        FROM clients c
        LEFT JOIN projects p ON c.client_id = p.client_id
      `);

      return rows[0];
    } catch (error) {
      console.error('Error getting client statistics:', error);
      throw error;
    }
  }

  /**
   * Get top clients by project count
   * @param {number} limit - Number of clients to return
   * @returns {Promise<Array>} Top clients
   */
  async getTopClients(limit = 10) {
    try {
      // Note: Using template literal for LIMIT is safe here because
      // limit is validated to be a number in the service layer
      const [rows] = await pool.execute(
        `SELECT
          c.client_id,
          c.client_name,
          c.client_phone,
          COUNT(p.project_id) as project_count,
          SUM(p.budget) as total_budget
        FROM clients c
        LEFT JOIN projects p ON c.client_id = p.client_id
        GROUP BY c.client_id, c.client_name, c.client_phone
        HAVING project_count > 0
        ORDER BY project_count DESC, total_budget DESC
        LIMIT ${parseInt(limit)}`
      );

      return rows;
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw error;
    }
  }
}

module.exports = new ClientRepository();
