const { pool } = require('../config/database');

/**
 * Supplier Repository (Data Access Layer)
 *
 * Handles all database operations for suppliers including
 * their associated project materials.
 */

class SupplierRepository {
  /**
   * Get all suppliers with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of suppliers
   */
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT
          s.supplier_id,
          s.supplier_name,
          s.supplier_phone,
          COUNT(DISTINCT pm.project_material_id) as material_supply_count,
          SUM(pm.total_cost) as total_supply_value
        FROM suppliers s
        LEFT JOIN project_materials pm ON s.supplier_id = pm.supplier_id
        WHERE 1=1
      `;
      const params = [];

      // Filter by name
      if (filters.name) {
        query += ` AND s.supplier_name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      query += ` GROUP BY s.supplier_id, s.supplier_name, s.supplier_phone`;

      // Sorting
      const sortBy = filters.sort_by || 'supplier_id';
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding all suppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier by ID with material supplies
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Object|null>} Supplier object with details
   */
  async findById(supplierId) {
    try {
      // Get supplier basic info
      const [supplierRows] = await pool.execute(
        `SELECT
          supplier_id,
          supplier_name,
          supplier_phone
        FROM suppliers
        WHERE supplier_id = ?`,
        [supplierId]
      );

      if (supplierRows.length === 0) {
        return null;
      }

      const supplier = supplierRows[0];

      // Get material supplies for this supplier
      const [materialRows] = await pool.execute(
        `SELECT
          pm.project_material_id,
          pm.project_id,
          p.project_name,
          pm.material_id,
          m.material_name,
          pm.quantity,
          pm.total_cost
        FROM project_materials pm
        JOIN projects p ON pm.project_id = p.project_id
        JOIN materials m ON pm.material_id = m.material_id
        WHERE pm.supplier_id = ?
        ORDER BY pm.project_material_id DESC`,
        [supplierId]
      );

      return {
        ...supplier,
        material_supplies: materialRows
      };
    } catch (error) {
      console.error('Error finding supplier by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Promise<Object>} Created supplier
   */
  async create(supplierData) {
    try {
      const { supplier_name, supplier_phone } = supplierData;

      const [result] = await pool.execute(
        `INSERT INTO suppliers (supplier_name, supplier_phone)
        VALUES (?, ?)`,
        [supplier_name, supplier_phone || null]
      );

      const supplierId = result.insertId;

      // Return the created supplier
      return this.findById(supplierId);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Update supplier
   * @param {number} supplierId - Supplier ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated supplier
   */
  async update(supplierId, updates) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      if (updates.supplier_name !== undefined) {
        fields.push('supplier_name = ?');
        values.push(updates.supplier_name);
      }
      if (updates.supplier_phone !== undefined) {
        fields.push('supplier_phone = ?');
        values.push(updates.supplier_phone);
      }

      if (fields.length === 0) {
        return this.findById(supplierId);
      }

      values.push(supplierId);

      await pool.execute(
        `UPDATE suppliers SET ${fields.join(', ')} WHERE supplier_id = ?`,
        values
      );

      return this.findById(supplierId);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Delete supplier
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(supplierId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Note: Due to foreign key constraints, this will fail if supplier has material supplies
      // We keep this behavior to prevent accidental data loss
      await connection.execute(
        'DELETE FROM suppliers WHERE supplier_id = ?',
        [supplierId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting supplier:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if supplier exists
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(supplierId) {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM suppliers WHERE supplier_id = ? LIMIT 1',
        [supplierId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking supplier existence:', error);
      throw error;
    }
  }

  /**
   * Check if supplier name exists
   * @param {string} supplierName - Supplier name
   * @param {number} excludeId - Supplier ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async nameExists(supplierName, excludeId = null) {
    try {
      let query = 'SELECT 1 FROM suppliers WHERE supplier_name = ?';
      const params = [supplierName];

      if (excludeId) {
        query += ' AND supplier_id != ?';
        params.push(excludeId);
      }

      const [rows] = await pool.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking supplier name existence:', error);
      throw error;
    }
  }

  /**
   * Get supplier statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(DISTINCT s.supplier_id) as total_suppliers,
          COUNT(DISTINCT pm.project_material_id) as total_supplies,
          SUM(pm.total_cost) as total_supply_value,
          AVG(pm.total_cost) as average_supply_cost
        FROM suppliers s
        LEFT JOIN project_materials pm ON s.supplier_id = pm.supplier_id
      `);

      return rows[0];
    } catch (error) {
      console.error('Error getting supplier statistics:', error);
      throw error;
    }
  }

  /**
   * Get top suppliers by supply value
   * @param {number} limit - Number of suppliers to return
   * @returns {Promise<Array>} Top suppliers
   */
  async getTopSuppliers(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          s.supplier_id,
          s.supplier_name,
          s.supplier_phone,
          COUNT(pm.project_material_id) as supply_count,
          SUM(pm.total_cost) as total_supply_value
        FROM suppliers s
        LEFT JOIN project_materials pm ON s.supplier_id = pm.supplier_id
        GROUP BY s.supplier_id, s.supplier_name, s.supplier_phone
        HAVING supply_count > 0
        ORDER BY total_supply_value DESC, supply_count DESC
        LIMIT ${parseInt(limit)}`
      );

      return rows;
    } catch (error) {
      console.error('Error getting top suppliers:', error);
      throw error;
    }
  }
}

module.exports = new SupplierRepository();
