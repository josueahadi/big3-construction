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

module.exports = {
  requireAuth,
  optionalAuth
};
