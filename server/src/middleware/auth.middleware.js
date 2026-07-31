const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey_vendorhub_enterprise_2026");
    
    // Attach user to request
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
        throw new ApiError(401, "User no longer exists");
    }

    // JWT Versioning Check for Multi-Tenancy
    if (req.user.tenantVersion && decoded.tenantVersion !== req.user.tenantVersion) {
        throw new ApiError(401, "Your session has expired due to an organization change. Please log in again.");
    }

    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized to access this route");
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
};

module.exports = { protect, authorize };
