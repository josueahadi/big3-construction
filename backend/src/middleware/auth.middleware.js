const passport = require('passport');

/**
 * Authentication Middleware
 *
 * This middleware uses Passport.js to verify JWT tokens.
 * If token is valid, it populates req.user with user data.
 */

/**
 * Require JWT authentication
 * Use this middleware to protect routes that require authentication
 */
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * Optional authentication
 * Authenticates if token is present, but doesn't reject if absent
 * Useful for routes that behave differently for authenticated users
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    // Attach user if found, otherwise continue without user
    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
};

/**
 * Admin-only middleware
 * Requires authentication and Admin role
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Role-based access control middleware
 * Requires authentication and one of the specified roles
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  adminOnly,
  requireRole
};
