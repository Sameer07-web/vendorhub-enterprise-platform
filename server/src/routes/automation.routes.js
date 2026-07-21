const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('Admin')); // Only admins can manage automation rules

router.route('/')
  .post(automationController.createRule)
  .get(automationController.getRules);

router.route('/:id')
  .get(automationController.getRuleById)
  .put(automationController.updateRule)
  .delete(automationController.deleteRule);

module.exports = router;
