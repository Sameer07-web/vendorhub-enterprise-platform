const auditService = require("../services/audit.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Fetch system audit logs (Admin only)
 */
const getSystemAuditLogs = catchAsync(async (req, res) => {
  const result = await auditService.getAuditLogs({}, req.query);
  res.status(200).json(new ApiResponse(200, "Audit logs retrieved successfully", result));
});

module.exports = {
  getSystemAuditLogs
};
