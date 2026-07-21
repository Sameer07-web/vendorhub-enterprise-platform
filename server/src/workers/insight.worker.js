const { Worker } = require('bullmq');
const insightProcessor = require('../processors/insight.processor');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379
};

const insightWorker = new Worker('vendorhub-insight', insightProcessor, { connection });

insightWorker.on('completed', (job, returnvalue) => {
  console.log(`[InsightWorker] Job ${job.id} completed. Generated ${returnvalue.count} insights.`);
});

insightWorker.on('failed', (job, err) => {
  console.error(`[InsightWorker] Job ${job.id} failed:`, err);
});

module.exports = insightWorker;
