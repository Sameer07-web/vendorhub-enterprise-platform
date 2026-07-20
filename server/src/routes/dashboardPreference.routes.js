const express = require('express');
const router = express.Router();
const dashboardPreferenceController = require('../controllers/dashboardPreference.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', dashboardPreferenceController.getPreferences);
router.put('/', dashboardPreferenceController.updatePreferences);

module.exports = router;
