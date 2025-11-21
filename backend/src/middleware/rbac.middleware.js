/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * This middleware checks if the authenticated user has the required role(s)
 * to access a specific endpoint.
 *
 * Roles hierarchy (from highest to lowest privilege):
 * 1. Admin - Full access to all resources
 * 2. PM (Project Manager) - Can manage assigned projects
 * 3. Site Supervisor - Read-only access to assigned projects
 */

/**
 * Check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 *
 * @example
 * // Only Admin can access
 * router.delete('/projects/:id', requireAuth, requireRole(['Admin']), deleteProject);
 *
 * // Admin or PM can access
 * router.put('/projects/:id', requireAuth, requireRole(['Admin', 'PM']), updateProject);
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 * Shorthand for requireRole(['Admin'])
 */
const adminOnly = requireRole(['Admin']);

/**
 * Admin or PM middleware
 * Shorthand for requireRole(['Admin', 'PM'])
 */
const adminOrPM = requireRole(['Admin', 'PM']);

/**
 * Check if user is accessing their own resource
 * @param {string} userIdParam - Name of the route parameter containing user ID
 * @returns {Function} Express middleware function
 *
 * @example
 * router.put('/users/:userId/profile', requireAuth, requireSelfOrAdmin('userId'), updateProfile);
 */
const requireSelfOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const targetUserId = parseInt(req.params[userIdParam]);
    const currentUserId = req.user.user_id;

    // Allow if admin or if user is accessing their own resource
    if (req.user.role === 'Admin' || currentUserId === targetUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'You can only access your own resources'
    });
  };
};

module.exports = {
  requireRole,
  adminOnly,
  adminOrPM,
  requireSelfOrAdmin
};
