const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// Optional: you can add specific role checks for reports if needed
// e.g., const { authorize } = require('../middleware/auth.middleware');
// router.use(protect, authorize('admin', 'manager'));

router.use(protect); // Ensure all report endpoints are authenticated

router.get('/:type', reportController.getReportPreview);
router.get('/:type/export', reportController.exportReport);

module.exports = router;
