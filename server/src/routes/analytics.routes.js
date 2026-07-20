const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { protect } = require("../middleware/auth.middleware");

// Protect all analytics routes with JWT authentication
router.use(protect);

router.get("/overview", analyticsController.getOverview);
router.get("/dashboard", analyticsController.getDashboardKPIs);
router.get("/spend", analyticsController.getSpendAnalytics);
router.get("/vendors", analyticsController.getVendorAnalytics);
router.get("/departments", analyticsController.getDepartmentAnalytics);
router.get("/procurement", analyticsController.getProcurementAnalytics);

module.exports = router;
