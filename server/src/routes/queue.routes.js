const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin')); // Only admins can see queue health

router.get('/health', queueController.getQueueHealth);

module.exports = router;
