const fs = require('fs');
const path = require('path');
const ExportJob = require('../../models/ExportJob');
const reportService = require('../../services/report.service');
const storageService = require('../../services/storage.service');

module.exports = async (job) => {
  const { jobId: exportJobId } = job.data;
  const exportJob = await ExportJob.findById(exportJobId).populate('user');
  
  if (!exportJob) {
    throw new Error(`ExportJob ${exportJobId} not found`);
  }

  try {
    await exportJob.updateOne({ status: 'processing', progress: 10, progressStage: 'Loading Data' });
    await job.updateProgress(10);
    
    // Determine filename
    const dateStr = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const filename = `${exportJob.reportType}_${dateStr}_${timestamp}.${exportJob.format}`;
    
    // We will pipe the report to a temp file first, then upload it.
    // Since our StorageService supports streams, we can pipe directly to a PassThrough
    // But since it's local storage right now, let's just create a write stream or use a PassThrough.
    const { PassThrough } = require('stream');
    const pass = new PassThrough();
    
    await exportJob.updateOne({ progress: 40, progressStage: 'Generating' });
    await job.updateProgress(40);

    const uploadPromise = storageService.uploadReport(filename, pass);
    
    if (exportJob.format === 'csv') {
      await reportService.exportCSV(exportJob.reportType, exportJob.filters, pass, exportJob.user);
    } else if (exportJob.format === 'excel') {
      await reportService.exportExcel(exportJob.reportType, exportJob.filters, pass, exportJob.user);
    } else if (exportJob.format === 'pdf') {
      await reportService.exportPDF(exportJob.reportType, exportJob.filters, pass, exportJob.user);
    }

    await exportJob.updateOne({ progress: 80, progressStage: 'Uploading' });
    await job.updateProgress(80);

    const fileUrl = await uploadPromise;

    await exportJob.updateOne({ 
      status: 'completed', 
      progress: 100, 
      progressStage: 'Completed',
      fileUrl,
      lastRunAt: new Date()
    });
    await job.updateProgress(100);

    // If recipients are specified, this was likely a scheduled report, so we email them.
    if (exportJob.recipients && exportJob.recipients.length > 0) {
      const emailService = require('../../services/email.service');
      const downloadLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${fileUrl}`;
      for (const email of exportJob.recipients) {
        await emailService.sendGenericEmail(
          { email }, 
          `Scheduled Report: ${exportJob.reportType}`, 
          `Your scheduled report is ready for download.`, 
          downloadLink
        );
      }
    }

    return { fileUrl, exportJobId };
  } catch (error) {
    await exportJob.updateOne({ 
      status: 'failed', 
      errorMessage: error.message,
      progressStage: 'Failed'
    });
    throw error;
  }
};
