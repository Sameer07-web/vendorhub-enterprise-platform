const express = require('express');
const router = express.Router();
const savedReportController = require('../controllers/savedReport.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', savedReportController.getSavedReports);
router.get('/recent', savedReportController.getRecentActivity);
router.post('/', savedReportController.createSavedReport);
router.put('/:id', savedReportController.updateSavedReport);
router.delete('/:id', savedReportController.deleteSavedReport);
router.patch('/:id/run', savedReportController.markReportAsRun);

module.exports = router;
