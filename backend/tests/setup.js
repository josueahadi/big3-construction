/**
 * Jest Setup File
 * Configure testing environment, mocks, and global utilities
 */

require('dotenv').config({ path: '.env.test' });

// Mock database module before any imports
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
  end: jest.fn()
}));

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests unless explicitly needed
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

module.exports = {};
