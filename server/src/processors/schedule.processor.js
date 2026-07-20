const ScheduledReport = require('../../models/ScheduledReport');
const ExportJob = require('../../models/ExportJob');
const exportQueue = require('../../queues/export.queue');

module.exports = async (job) => {
  const { scheduledReportId } = job.data;
  
  const report = await ScheduledReport.findById(scheduledReportId);
  if (!report || !report.isActive) {
    return { skipped: true, reason: 'Report inactive or not found' };
  }

  // Create an ExportJob for this scheduled execution
  const exportJob = await ExportJob.create({
    user: report.user, // System or owner
    reportType: report.reportType,
    format: report.format,
    filters: report.filters,
    recipients: report.recipients,
    scheduledReportId: report._id,
    status: 'waiting',
    progressStage: 'Queued'
  });

  // Enqueue it to the export queue
  await exportQueue.add('export-report', { jobId: exportJob._id.toString() }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 10s, 20s
    }
  });

  // Update lastRunAt
  report.lastRunAt = new Date();
  await report.save();

  return { exportJobId: exportJob._id };
};
