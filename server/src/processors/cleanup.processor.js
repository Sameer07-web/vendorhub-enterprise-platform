const ExportJob = require('../../models/ExportJob');
const storageService = require('../../services/storage.service');

module.exports = async (job) => {
  // Retention period: default 7 days
  const retentionDays = parseInt(process.env.REPORT_RETENTION_DAYS || '7', 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const oldJobs = await ExportJob.find({
    status: 'completed',
    fileUrl: { $ne: null },
    createdAt: { $lt: cutoffDate }
  });

  let deletedCount = 0;
  for (const exportJob of oldJobs) {
    if (exportJob.fileUrl) {
      // Extract filename from the relative URL (e.g. /uploads/reports/file.csv)
      const parts = exportJob.fileUrl.split('/');
      const filename = parts[parts.length - 1];
      try {
        await storageService.deleteReport(filename);
      } catch (err) {
        console.error(`Failed to delete file ${filename}:`, err);
      }
      
      // Mark as expired to remove download link in UI, but keep history
      await exportJob.updateOne({ status: 'expired', fileUrl: null });
      deletedCount++;
    }
  }

  return { deletedCount, cutoffDate };
};
