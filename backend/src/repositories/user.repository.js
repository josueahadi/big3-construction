const { pool } = require('../config/database');

/**
 * User Repository (Data Access Layer)
 *
 * This module handles all database operations related to users.
 * Following the Repository pattern, all SQL queries are isolated here.
 */

class UserRepository {
  /**
   * Find user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, email, password_hash, role, preferred_language, worker_id, created_at, updated_at FROM users WHERE user_id = ?',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, email, password_hash, role, preferred_language, worker_id, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password_hash - Hashed password
   * @param {string} userData.role - User role (Admin, PM, Site Supervisor)
   * @param {number|null} userData.worker_id - Associated worker ID
   * @param {string} userData.preferred_language - Preferred language (default: 'en')
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    try {
      const { email, password_hash, role, worker_id, preferred_language = 'en' } = userData;

      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, role, worker_id, preferred_language) VALUES (?, ?, ?, ?, ?)',
        [email, password_hash, role, worker_id || null, preferred_language]
      );

      // Return the created user
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated user object
   */
  async update(userId, updates) {
    try {
      const allowedFields = ['email', 'password_hash', 'role', 'preferred_language', 'worker_id'];
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

      values.push(userId);

      await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
        values
      );

      return this.findById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users (for admin)
   * @returns {Promise<Array>} Array of user objects
   */
  async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, email, role, preferred_language, worker_id, created_at FROM users'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [email]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();
