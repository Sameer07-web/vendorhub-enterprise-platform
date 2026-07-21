const schedulerQueue = require('../../queues/scheduler.queue');
const AutomationRule = require('../../models/AutomationRule');
const SYSTEM_EVENTS = require('../../constants/events');

class SchedulerService {
  async init() {
    console.log('[SchedulerService] Initializing scheduled automations...');
    await this.syncSchedules();
  }

  async syncSchedules() {
    // Get all active rules that have a schedule (cron)
    const scheduledRules = await AutomationRule.find({ 
      isActive: true, 
      schedule: { $exists: true, $ne: '' } 
    });

    // Remove all existing repeatable jobs to refresh
    const repeatableJobs = await schedulerQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await schedulerQueue.removeRepeatableByKey(job.key);
    }

    // Add back the active scheduled jobs
    for (const rule of scheduledRules) {
      await this.scheduleRule(rule);
    }
  }

  async scheduleRule(rule) {
    if (!rule.schedule) return;

    // Use ruleId as a custom job ID to avoid duplicates
    const jobId = `scheduled-rule-${rule._id}`;
    
    await schedulerQueue.add(
      'execute-scheduled-rule',
      {
        ruleId: rule._id,
        trigger: SYSTEM_EVENTS.SCHEDULED_TRIGGER
      },
      {
        repeat: {
          pattern: rule.schedule
        },
        jobId
      }
    );
    console.log(`[SchedulerService] Scheduled rule ${rule._id} with cron: ${rule.schedule}`);
  }

  async removeSchedule(ruleId) {
    const repeatableJobs = await schedulerQueue.getRepeatableJobs();
    const jobId = `scheduled-rule-${ruleId}`;
    
    const jobToRemove = repeatableJobs.find(job => job.id === jobId);
    if (jobToRemove) {
      await schedulerQueue.removeRepeatableByKey(jobToRemove.key);
      console.log(`[SchedulerService] Removed schedule for rule ${ruleId}`);
    }
  }
}

module.exports = new SchedulerService();
