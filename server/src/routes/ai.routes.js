const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiter specifically for AI to protect quotas
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { success: false, error: 'Too many requests to the AI service. Please try again later.' }
});

router.use(protect);
router.use(aiLimiter);

router.post('/query', aiController.queryCopilot);
router.get('/draft/:id', aiController.getDraft);

module.exports = router;
