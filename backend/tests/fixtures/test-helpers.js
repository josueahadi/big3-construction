/**
 * Test Helpers - Utility functions for testing
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a valid JWT token for testing
 * @param {object} payload - Token payload
 * @param {string} secret - JWT secret (defaults to test secret)
 * @param {object} options - JWT options
 * @returns {string} JWT token
 */
const generateToken = (payload, secret = 'test_secret_key', options = {}) => {
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
    ...options
  });
};

/**
 * Create a mock Express request object
 * @param {object} options - Request options
 * @returns {object} Mock request object
 */
const createMockRequest = (options = {}) => {
  return {
    user: options.user || null,
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: {
      'authorization': options.token ? `Bearer ${options.token}` : '',
      ...options.headers
    },
    ...options
  };
};

/**
 * Create a mock Express response object
 * @returns {object} Mock response object with spy methods
 */
const createMockResponse = () => {
  const res = {};
  
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  
  return res;
};

/**
 * Create a mock next (error handler) function
 * @returns {jest.Mock} Mock next function
 */
const createMockNext = () => jest.fn();

/**
 * Verify token structure
 * @param {object} token - Token payload
 * @param {string} expectedRole - Expected user role
 * @returns {boolean} True if token is valid
 */
const verifyTokenStructure = (token, expectedRole = null) => {
  if (!token || !token.user_id || !token.role) {
    return false;
  }
  
  if (expectedRole && token.role !== expectedRole) {
    return false;
  }
  
  return true;
};

/**
 * Mock database response
 * @param {array} rows - Mock database rows
 * @returns {array} Mock rows
 */
const mockDatabaseResponse = (rows = []) => {
  return Array.isArray(rows) ? rows : [rows];
};

/**
 * Create authentication header
 * @param {string} token - JWT token
 * @returns {object} Authorization header
 */
const createAuthHeader = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Simulate database error
 * @param {string} message - Error message
 * @returns {Error} Error object
 */
const createDatabaseError = (message = 'Database error') => {
  const error = new Error(message);
  error.code = 'PROTOCOL_CONNECTION_LOST';
  return error;
};

/**
 * Compare two dates with tolerance
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {number} toleranceMs - Tolerance in milliseconds (default 1000ms)
 * @returns {boolean} True if dates are within tolerance
 */
const datesAreClose = (date1, date2, toleranceMs = 1000) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return diff <= toleranceMs;
};

/**
 * Calculate distance between two coordinates (for geospatial testing)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
const calculateTestDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = {
  generateToken,
  createMockRequest,
  createMockResponse,
  createMockNext,
  verifyTokenStructure,
  mockDatabaseResponse,
  createAuthHeader,
  createDatabaseError,
  datesAreClose,
  calculateTestDistance
};
