const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/:id/action', workflowController.processAction);

module.exports = router;
