const AuthorizationService = require('../services/AuthorizationService');
const ApiError = require('../utils/ApiError');

/**
 * Middleware checking active organization membership and specific permission policy boundaries
 * @param {string} permission 
 */
const requirePermission = (permission) => async (req, res, next) => {
  try {
    if (!req.user || !req.organization) {
      throw new ApiError(401, "Authentication and tenant context is required");
    }

    const member = await AuthorizationService.resolveMembership(req.organization._id, req.user._id);

    if (!member) {
      throw new ApiError(403, "Access Denied: You are not an active member of this organization");
    }

    // Attach resolved member context to request
    req.member = member;

    // Build context containing active user attributes
    const context = {
      user: {
        _id: req.user._id,
        department: req.user.department,
      }
    };

    // Grab resource instance payload from request body if checking ownership/amount constraints
    const resourceInstance = req.body;

    const authorized = await AuthorizationService.hasPermission(member, permission, context, resourceInstance);
    if (!authorized) {
      throw new ApiError(403, "Access Denied: Insufficient permissions");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware checking active organization membership and specific role policy boundaries
 * @param {string} role 
 */
const requireRole = (role) => async (req, res, next) => {
  try {
    if (!req.user || !req.organization) {
      throw new ApiError(401, "Authentication and tenant context is required");
    }

    const member = await AuthorizationService.resolveMembership(req.organization._id, req.user._id);

    if (!member) {
      throw new ApiError(403, "Access Denied: You are not an active member of this organization");
    }

    req.member = member;

    const authorized = await AuthorizationService.hasRole(member, role);
    if (!authorized) {
      throw new ApiError(403, `Access Denied: Requires role ${role}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requirePermission,
  requireRole,
};
