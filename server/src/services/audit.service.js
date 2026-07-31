const AuditLogRepository = require("../repositories/AuditLogRepository");

/**
 * Log an enterprise action/event in the database for compliance and auditing.
 */
const logEvent = async ({
  organizationId,
  userId,
  correlationId = null,
  requestId = null,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    if (!organizationId) {
      console.warn("Audit log skipped: organizationId missing");
      return;
    }
    await AuditLogRepository.create(organizationId, {
      user: userId,
      correlationId,
      requestId,
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
 * Fetch logs for audit views
 */
const getAuditLogs = async (sessionOrOrgId, filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { ...filter };

  const [logs, total] = await Promise.all([
    AuditLogRepository.findMany(sessionOrOrgId, query, null, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: [{ path: "user", select: "fullName email role" }]
    }),
    AuditLogRepository.count(sessionOrOrgId, query)
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
