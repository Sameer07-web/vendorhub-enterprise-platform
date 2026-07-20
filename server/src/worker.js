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

  // Also setup repeatable cron jobs
  const cleanupQueue = require('./queues/cleanup.queue');
  
  // Cleanup runs daily at 2:00 AM
  await cleanupQueue.add('daily-cleanup', {}, {
    repeat: { pattern: '0 2 * * *' }
  });

  console.log('[Worker] Workers are running and listening for jobs.');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Worker] Shutting down gracefully...');
    await exportWorker.close();
    await scheduleWorker.close();
    await cleanupWorker.close();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startWorkers();
