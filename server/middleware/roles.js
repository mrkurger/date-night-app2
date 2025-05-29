// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for roles middleware
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }

  next();
};

// Middleware to check if user is an advertiser
const isAdvertiser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'advertiser' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Advertiser role required.',
    });
  }

  next();
};

// Middleware to check if user is the owner of a resource
const isResourceOwner = resourceField => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceId = req.params[resourceField];

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: `Resource ID (${resourceField}) is required`,
      });
    }

    // If user is admin, allow access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is the owner of the resource
    if (
      req[resourceField] &&
      req[resourceField].user &&
      req[resourceField].user.toString() === req.user._id.toString()
    ) {
      return next();
    }

    // If resource is not loaded yet, continue and let the controller handle it
    if (!req[resourceField]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not the owner of this resource.',
    });
  };
};

/**
 * Role hierarchy (higher number = higher privilege)
 */
const ROLE_HIERARCHY = {
  user: 1,
  support: 2,
  moderator: 3,
  advertiser: 3,
  admin: 4,
};

/**
 * Generic authorization middleware with role hierarchy support
 * @param {string|Array} requiredRoles - Required role(s) for access
 * @param {Function} ownershipCheck - Optional function to check resource ownership
 * @returns {Function} Express middleware
 */
const authorize = (requiredRoles, ownershipCheck = null) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      const error = new Error('Access denied. User must be authenticated.');
      error.statusCode = 401;
      return next(error);
    }

    // Check if user has a role
    if (!req.user.role) {
      const error = new Error('Access denied. User role not found.');
      error.statusCode = 403;
      return next(error);
    }

    const userRole = req.user.role;
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;

    // Convert requiredRoles to array if it's a string
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has any of the required roles or higher
    const hasRequiredRole = rolesArray.some(role => {
      const requiredRoleLevel = ROLE_HIERARCHY[role] || 0;
      return userRoleLevel >= requiredRoleLevel;
    });

    if (!hasRequiredRole) {
      const error = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      return next(error);
    }

    // If user is admin, bypass ownership check
    if (userRole === 'admin') {
      return next();
    }

    // If ownership check is provided, run it
    if (ownershipCheck && typeof ownershipCheck === 'function') {
      const isOwner = ownershipCheck(req);
      if (!isOwner) {
        const error = new Error('Access denied. Insufficient permissions.');
        error.statusCode = 403;
        return next(error);
      }
    }

    next();
  };
};

export { isAdmin, isAdvertiser, isResourceOwner, authorize };
export default { isAdmin, isAdvertiser, isResourceOwner, authorize };
