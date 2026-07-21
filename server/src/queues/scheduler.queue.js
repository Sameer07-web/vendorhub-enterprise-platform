const { Queue } = require('bullmq');
const redisConfig = require('../config/redis');

// Central scheduler queue to handle recurring jobs
const schedulerQueue = new Queue('vendorhub-scheduler', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
});

module.exports = schedulerQueue;
