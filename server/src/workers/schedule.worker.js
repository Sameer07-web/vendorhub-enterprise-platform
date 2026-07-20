const { Worker } = require('bullmq');
const connection = require('../queues/connection');
const scheduleProcessor = require('../processors/schedule.processor');

const worker = new Worker('vendorhub-scheduled-report', scheduleProcessor, {
  connection,
  concurrency: 1 // Cron dispatcher doesn't need high concurrency
});

worker.on('completed', (job, returnvalue) => {
  if (returnvalue.skipped) {
    console.log(`[Worker] ScheduledReport ${job.data.scheduledReportId} skipped: ${returnvalue.reason}`);
  } else {
    console.log(`[Worker] ScheduledReport ${job.data.scheduledReportId} enqueued ExportJob ${returnvalue.exportJobId}`);
  }
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ScheduledReport ${job.data.scheduledReportId} failed:`, err.message);
});

module.exports = worker;
