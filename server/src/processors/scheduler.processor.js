const eventBus = require('../services/automation/eventBus');
const SYSTEM_EVENTS = require('../constants/events');

module.exports = async (job) => {
  const { ruleId, trigger } = job.data;
  
  if (!ruleId || !trigger) {
    throw new Error('Scheduled job missing required data: ruleId or trigger');
  }

  // A scheduled job just triggers the system event, letting AutomationService handle evaluation
  // The contextData can contain the ruleId to help the rule match its specific scheduled run
  eventBus.emit(SYSTEM_EVENTS.SCHEDULED_TRIGGER, { 
    scheduledRuleId: ruleId,
    timestamp: new Date()
  });

  return { success: true, ruleId };
};
