const { Worker } = require('bullmq');
const connection = require('../queues/connection');
const cleanupProcessor = require('../processors/cleanup.processor');

const worker = new Worker('vendorhub-cleanup', cleanupProcessor, {
  connection,
  concurrency: 1
});

worker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] Cleanup completed. Deleted ${returnvalue.deletedCount} files older than ${returnvalue.cutoffDate}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Cleanup failed:`, err.message);
});

module.exports = worker;
