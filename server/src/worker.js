require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Worker] Connected to MongoDB');
  } catch (err) {
    console.error('[Worker] MongoDB connection error:', err);
    process.exit(1);
  }
};

// Bootstrap Workers
const startWorkers = async () => {
  await connectDB();

  console.log('[Worker] Initializing BullMQ Workers...');

  const exportWorker = require('./workers/export.worker');
  const scheduleWorker = require('./workers/schedule.worker');
  const cleanupWorker = require('./workers/cleanup.worker');
  const workflowWorker = require('./workers/workflow.worker');
  const automationWorker = require('./workers/automation.worker');
  const schedulerWorker = require('./workers/scheduler.worker');
  const insightWorker = require('./workers/insight.worker');

  const schedulerService = require('./services/automation/scheduler.service');
  await schedulerService.init();

  // Also setup repeatable cron jobs
  const cleanupQueue = require('./queues/cleanup.queue');
  const insightQueue = require('./queues/insight.queue');
  
  // Cleanup runs daily at 2:00 AM
  await cleanupQueue.add('daily-cleanup', {}, {
    repeat: { pattern: '0 2 * * *' }
  });

  // Insights generation runs daily at 6:00 AM (as recommended by user)
  await insightQueue.add('daily-insights', {}, {
    repeat: { pattern: '0 6 * * *' }
  });

  console.log('[Worker] Workers are running and listening for jobs.');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Worker] Shutting down gracefully...');
    await exportWorker.close();
    await scheduleWorker.close();
    await cleanupWorker.close();
    await workflowWorker.close();
    await automationWorker.close();
    await schedulerWorker.close();
    await insightWorker.close();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startWorkers();
