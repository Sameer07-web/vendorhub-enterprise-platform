const savedReportService = require('../services/savedReport.service');

const getSavedReports = async (req, res) => {
  try {
    const reports = await savedReportService.getSavedReports(req.user._id);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching saved reports:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved reports' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const recent = await savedReportService.getRecentReportsAndJobs(req.user._id);
    res.json({ success: true, data: recent });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent activity' });
  }
};

const createSavedReport = async (req, res) => {
  try {
    const report = await savedReportService.createSavedReport(req.user._id, req.body);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating saved report:', error);
    res.status(500).json({ success: false, error: 'Failed to create saved report' });
  }
};

const updateSavedReport = async (req, res) => {
  try {
    const report = await savedReportService.updateSavedReport(req.user._id, req.params.id, req.body);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating saved report:', error);
    res.status(500).json({ success: false, error: 'Failed to update saved report' });
  }
};

const deleteSavedReport = async (req, res) => {
  try {
    const report = await savedReportService.deleteSavedReport(req.user._id, req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting saved report:', error);
    res.status(500).json({ success: false, error: 'Failed to delete saved report' });
  }
};

const markReportAsRun = async (req, res) => {
  try {
    const report = await savedReportService.markAsRun(req.user._id, req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error marking report as run:', error);
    res.status(500).json({ success: false, error: 'Failed to update report timestamp' });
  }
};

module.exports = {
  getSavedReports,
  getRecentActivity,
  createSavedReport,
  updateSavedReport,
  deleteSavedReport,
  markReportAsRun
};
