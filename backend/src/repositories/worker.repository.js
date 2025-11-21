const { pool } = require('../config/database');

/**
 * Worker Repository (Data Access Layer)
 *
 * Handles all database operations for workers including
 * certifications and project assignments relationships.
 */

class WorkerRepository {
  /**
   * Get all workers with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of workers
   */
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT
          w.worker_id,
          w.first_name,
          w.last_name,
          w.phone,
          w.salary,
          COUNT(DISTINCT c.cert_id) as certification_count,
          COUNT(DISTINCT pa.assignment_id) as project_count
        FROM workers w
        LEFT JOIN certifications c ON w.worker_id = c.worker_id
        LEFT JOIN project_assignments pa ON w.worker_id = pa.worker_id
        WHERE 1=1
      `;
      const params = [];

      // Filter by name
      if (filters.name) {
        query += ` AND (w.first_name LIKE ? OR w.last_name LIKE ?)`;
        const namePattern = `%${filters.name}%`;
        params.push(namePattern, namePattern);
      }

      // Filter by minimum salary
      if (filters.min_salary) {
        query += ` AND w.salary >= ?`;
        params.push(filters.min_salary);
      }

      // Filter by maximum salary
      if (filters.max_salary) {
        query += ` AND w.salary <= ?`;
        params.push(filters.max_salary);
      }

      query += ` GROUP BY w.worker_id, w.first_name, w.last_name, w.phone, w.salary`;

      // Sorting
      const sortBy = filters.sort_by || 'worker_id';
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding all workers:', error);
      throw error;
    }
  }

  /**
   * Get worker by ID with certifications and assignments
   * @param {number} workerId - Worker ID
   * @returns {Promise<Object|null>} Worker object with details
   */
  async findById(workerId) {
    try {
      // Get worker basic info
      const [workerRows] = await pool.execute(
        `SELECT
          worker_id,
          first_name,
          last_name,
          phone,
          salary
        FROM workers
        WHERE worker_id = ?`,
        [workerId]
      );

      if (workerRows.length === 0) {
        return null;
      }

      const worker = workerRows[0];

      // Get certifications
      const [certRows] = await pool.execute(
        `SELECT
          cert_id,
          cert_name,
          expiry_date,
          CASE
            WHEN expiry_date < CURDATE() THEN 'expired'
            WHEN expiry_date < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
            ELSE 'valid'
          END as status
        FROM certifications
        WHERE worker_id = ?
        ORDER BY expiry_date DESC`,
        [workerId]
      );

      // Get project assignments
      const [assignmentRows] = await pool.execute(
        `SELECT
          pa.assignment_id,
          pa.project_id,
          pa.assignment_date,
          p.project_name,
          p.site_city,
          p.start_date,
          p.end_date
        FROM project_assignments pa
        JOIN projects p ON pa.project_id = p.project_id
        WHERE pa.worker_id = ?
        ORDER BY pa.assignment_date DESC`,
        [workerId]
      );

      return {
        ...worker,
        certifications: certRows,
        project_assignments: assignmentRows
      };
    } catch (error) {
      console.error('Error finding worker by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new worker
   * @param {Object} workerData - Worker data
   * @returns {Promise<Object>} Created worker
   */
  async create(workerData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { first_name, last_name, phone, salary } = workerData;

      // Insert worker
      const [result] = await connection.execute(
        `INSERT INTO workers (first_name, last_name, phone, salary)
        VALUES (?, ?, ?, ?)`,
        [first_name, last_name, phone || null, salary || null]
      );

      const workerId = result.insertId;

      await connection.commit();

      // Return the created worker
      return this.findById(workerId);
    } catch (error) {
      await connection.rollback();
      console.error('Error creating worker:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update worker
   * @param {number} workerId - Worker ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated worker
   */
  async update(workerId, updates) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      if (updates.first_name !== undefined) {
        fields.push('first_name = ?');
        values.push(updates.first_name);
      }
      if (updates.last_name !== undefined) {
        fields.push('last_name = ?');
        values.push(updates.last_name);
      }
      if (updates.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updates.phone);
      }
      if (updates.salary !== undefined) {
        fields.push('salary = ?');
        values.push(updates.salary);
      }

      if (fields.length === 0) {
        return this.findById(workerId);
      }

      values.push(workerId);

      await pool.execute(
        `UPDATE workers SET ${fields.join(', ')} WHERE worker_id = ?`,
        values
      );

      return this.findById(workerId);
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error;
    }
  }

  /**
   * Delete worker
   * @param {number} workerId - Worker ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(workerId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete related certifications
      await connection.execute(
        'DELETE FROM certifications WHERE worker_id = ?',
        [workerId]
      );

      // Delete project assignments
      await connection.execute(
        'DELETE FROM project_assignments WHERE worker_id = ?',
        [workerId]
      );

      // Delete worker
      await connection.execute(
        'DELETE FROM workers WHERE worker_id = ?',
        [workerId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting worker:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if worker exists
   * @param {number} workerId - Worker ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(workerId) {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM workers WHERE worker_id = ? LIMIT 1',
        [workerId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking worker existence:', error);
      throw error;
    }
  }

  /**
   * Add certification to worker
   * @param {number} workerId - Worker ID
   * @param {Object} certData - Certification data
   * @returns {Promise<Object>} Created certification
   */
  async addCertification(workerId, certData) {
    try {
      const { cert_name, expiry_date } = certData;

      const [result] = await pool.execute(
        `INSERT INTO certifications (cert_name, expiry_date, worker_id)
        VALUES (?, ?, ?)`,
        [cert_name, expiry_date || null, workerId]
      );

      const [certRows] = await pool.execute(
        'SELECT * FROM certifications WHERE cert_id = ?',
        [result.insertId]
      );

      return certRows[0];
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  /**
   * Update certification
   * @param {number} certId - Certification ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated certification
   */
  async updateCertification(certId, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.cert_name !== undefined) {
        fields.push('cert_name = ?');
        values.push(updates.cert_name);
      }
      if (updates.expiry_date !== undefined) {
        fields.push('expiry_date = ?');
        values.push(updates.expiry_date);
      }

      if (fields.length === 0) {
        const [rows] = await pool.execute(
          'SELECT * FROM certifications WHERE cert_id = ?',
          [certId]
        );
        return rows[0];
      }

      values.push(certId);

      await pool.execute(
        `UPDATE certifications SET ${fields.join(', ')} WHERE cert_id = ?`,
        values
      );

      const [certRows] = await pool.execute(
        'SELECT * FROM certifications WHERE cert_id = ?',
        [certId]
      );

      return certRows[0];
    } catch (error) {
      console.error('Error updating certification:', error);
      throw error;
    }
  }

  /**
   * Delete certification
   * @param {number} certId - Certification ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteCertification(certId) {
    try {
      await pool.execute(
        'DELETE FROM certifications WHERE cert_id = ?',
        [certId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting certification:', error);
      throw error;
    }
  }

  /**
   * Get workers with expiring certifications
   * @param {number} days - Days until expiry
   * @returns {Promise<Array>} Workers with expiring certs
   */
  async getWorkersWithExpiringCerts(days = 30) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          w.worker_id,
          w.first_name,
          w.last_name,
          w.phone,
          c.cert_id,
          c.cert_name,
          c.expiry_date,
          DATEDIFF(c.expiry_date, CURDATE()) as days_until_expiry
        FROM workers w
        JOIN certifications c ON w.worker_id = c.worker_id
        WHERE c.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY c.expiry_date ASC`,
        [days]
      );
      return rows;
    } catch (error) {
      console.error('Error getting workers with expiring certs:', error);
      throw error;
    }
  }

  /**
   * Get worker statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(*) as total_workers,
          AVG(salary) as average_salary,
          MIN(salary) as min_salary,
          MAX(salary) as max_salary,
          COUNT(DISTINCT c.cert_id) as total_certifications,
          SUM(CASE WHEN c.expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired_certifications,
          SUM(CASE WHEN c.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
        FROM workers w
        LEFT JOIN certifications c ON w.worker_id = c.worker_id
      `);

      return rows[0];
    } catch (error) {
      console.error('Error getting worker statistics:', error);
      throw error;
    }
  }
}

module.exports = new WorkerRepository();
