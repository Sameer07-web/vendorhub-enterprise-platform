const exportQueue = require('../queues/export.queue');
const scheduleQueue = require('../queues/schedule.queue');
const cleanupQueue = require('../queues/cleanup.queue');
const connection = require('../queues/connection');

const getQueueHealth = async (req, res) => {
  try {
    const redisStatus = connection.status;
    
    // Using BullMQ's getJobCounts() which returns an object like { waiting, active, completed, failed, delayed }
    const exportCounts = await exportQueue.getJobCounts();
    const scheduleCounts = await scheduleQueue.getJobCounts();
    const cleanupCounts = await cleanupQueue.getJobCounts();

    const workers = await exportQueue.getWorkers();

    res.json({
      success: true,
      data: {
        redis: redisStatus,
        workers: workers.length,
        queues: {
          exports: exportCounts,
          schedules: scheduleCounts,
          cleanup: cleanupCounts
        }
      }
    });
  } catch (error) {
    console.error('Queue Health Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve queue health' });
  }
};

module.exports = {
  getQueueHealth
};
