const { Worker } = require('bullmq');
const connection = require('../queues/connection');
const exportProcessor = require('../processors/export.processor');

// BullMQ recommends a high concurrency for I/O bound jobs.
// Exporting can be somewhat CPU bound (especially PDF), so we limit concurrency.
const worker = new Worker('vendorhub-export', exportProcessor, {
  connection,
  concurrency: parseInt(process.env.EXPORT_WORKER_CONCURRENCY || '2', 10)
});

worker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] ExportJob ${job.id} completed. URL: ${returnvalue.fileUrl}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ExportJob ${job.id} failed:`, err.message);
});

module.exports = worker;
