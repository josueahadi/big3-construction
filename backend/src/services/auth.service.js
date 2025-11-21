const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

/**
 * Authentication Service (Business Logic Layer)
 *
 * This module handles authentication business logic including:
 * - User registration with password hashing
 * - User login with JWT generation
 * - Password validation
 */

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.role - User role
   * @param {number|null} userData.worker_id - Associated worker ID
   * @returns {Promise<Object>} Object containing token and user info
   */
  async register(userData) {
    const { email, password, role, worker_id } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    // Validate role
    const validRoles = ['Admin', 'PM', 'Site Supervisor'];
    if (!validRoles.includes(role)) {
      throw new Error('INVALID_ROLE');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await userRepository.create({
      email,
      password_hash,
      role,
      worker_id,
      preferred_language: 'en'
    });

    // Generate JWT
    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
        preferred_language: newUser.preferred_language
      }
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Object containing token and user info
   */
  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        preferred_language: user.preferred_language
      }
    };
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      language: user.preferred_language
    };

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password changed
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userRepository.update(userId, { password_hash });

    return true;
  }
}

module.exports = new AuthService();
