const express = require("express");
const router = express.Router();
const { getSystemAuditLogs } = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Only Admins can access audit logs
router.get("/audit-logs", protect, authorize("Admin"), getSystemAuditLogs);

module.exports = router;
