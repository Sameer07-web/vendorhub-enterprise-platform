const { Worker } = require('bullmq');
const connection = require('../queues/connection');
const automationProcessor = require('../processors/automation.processor');

const worker = new Worker('vendorhub-automation', async (job) => {
  if (job.name === 'execute-rule') {
    return automationProcessor(job);
  }
  throw new Error(`Unknown job name: ${job.name}`);
}, {
  connection,
  concurrency: 5
});

worker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] Automation job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Automation job ${job.id} failed:`, err.message);
});

module.exports = worker;
