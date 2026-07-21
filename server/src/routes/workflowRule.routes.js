const express = require('express');
const router = express.Router();
const workflowRuleController = require('../controllers/workflowRule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('Admin')); // Only admins should manage templates and workflow rules for now

router.get('/templates', workflowRuleController.getTemplates);
router.post('/templates/:id/clone', workflowRuleController.cloneTemplate);

module.exports = router;
