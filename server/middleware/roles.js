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

export { isAdmin, isAdvertiser, isResourceOwner };
export default { isAdmin, isAdvertiser, isResourceOwner };
