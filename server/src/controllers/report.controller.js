const reportService = require('../services/report.service');
const { REPORT_TYPES } = require('../config/report.config');
const ExportJob = require('../models/ExportJob');
const exportQueue = require('../queues/export.queue');

const getReportPreview = async (req, res) => {
  try {
    const { type } = req.params;
    if (!REPORT_TYPES[type]) {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }
    
    // Convert query parameters to filters
    const filters = { ...req.query };
    
    const preview = await reportService.getPreview(type, filters, req.user);
    res.json({ success: true, data: preview });
  } catch (error) {
    console.error('Error in getReportPreview:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report preview' });
  }
};

const enqueueExport = async (req, res, format) => {
  const { type } = req.params;
  if (!REPORT_TYPES[type]) {
    return res.status(400).json({ success: false, error: 'Invalid report type' });
  }

  try {
    const job = await ExportJob.create({
      user: req.user._id,
      reportType: type,
      format,
      filters: req.query,
      status: 'queued',
      progressStage: 'Queued'
    });

    await exportQueue.add('export-report', { jobId: job._id.toString() }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    res.status(202).json({
      success: true,
      message: 'Export job queued',
      data: { exportJobId: job._id, status: 'queued' }
    });
  } catch (error) {
    console.error(`Export ${format} Error:`, error);
    res.status(500).json({ success: false, error: `Failed to queue ${format} export` });
  }
};

const exportReport = async (req, res) => {
  const { type } = req.params;
  const { format } = req.query;
  
  if (!['csv', 'excel', 'pdf'].includes(format)) {
    return res.status(400).json({ success: false, error: 'Invalid export format' });
  }

  await enqueueExport(req, res, format);
};

module.exports = {
  getReportPreview,
  exportReport
};
