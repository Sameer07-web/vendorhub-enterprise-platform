const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const insightController = require('../controllers/insight.controller');

router.use(protect);

// Only Admins and Managers can view insights
router.get('/', authorize('Admin', 'Manager'), insightController.getInsights);

// Only Admins can trigger generation manually
router.post('/generate', authorize('Admin'), insightController.generateInsights);

// Admins and Managers can update status
router.put('/:id/status', authorize('Admin', 'Manager'), insightController.updateInsightStatus);

module.exports = router;
