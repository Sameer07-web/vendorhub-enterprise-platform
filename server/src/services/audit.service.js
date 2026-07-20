const AuditLog = require("../models/AuditLog");

/**
 * Log an enterprise action/event in the database for compliance and auditing.
 */
const logEvent = async ({
  userId,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
};

/**
 * Fetch logs for audit views (e.g. for Admin/Manager dashboard)
 */
const getAuditLogs = async (filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { ...filter };

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName email role")
      .lean(),
    AuditLog.countDocuments(query)
  ]);

  return {
    logs,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

module.exports = {
  logEvent,
  getAuditLogs
};
