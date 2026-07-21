const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const schedulerProcessor = require('../processors/scheduler.processor');

const schedulerWorker = new Worker('vendorhub-scheduler', schedulerProcessor, {
  connection: redisConfig,
  concurrency: 5 // Run up to 5 scheduled triggers concurrently
});

schedulerWorker.on('completed', (job) => {
  console.log(`[Scheduler Worker] Job ${job.id} completed successfully.`);
});

schedulerWorker.on('failed', (job, err) => {
  console.error(`[Scheduler Worker] Job ${job?.id} failed:`, err);
});

module.exports = schedulerWorker;
