/**
 * Error Handling Middleware
 *
 * Centralized error handling for the Express application.
 * This should be the last middleware in the chain.
 */

/**
 * 404 Not Found handler
 * Use this before the error handler to catch routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 * All errors in the application will be caught here
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error if statusCode is 200 (success)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    // Include additional error details if available
    details: err.details || undefined
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Database error handler
 * Transforms database errors into user-friendly messages
 */
const handleDatabaseError = (err, req, res, next) => {
  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'A record with this information already exists'
    });
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference - the related record does not exist'
    });
  }

  // MySQL connection error
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed. Please try again later.'
    });
  }

  // Pass to next error handler
  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  handleDatabaseError
};
