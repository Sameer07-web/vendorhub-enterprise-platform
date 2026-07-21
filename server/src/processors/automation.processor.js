const actionExecutor = require('../services/automation/actionExecutor');
const AutomationExecution = require('../models/AutomationExecution');

module.exports = async (job) => {
  const { ruleId, trigger, contextData, actions } = job.data;
  
  const start = Date.now();
  let status = 'SUCCESS';
  let errorMessage = null;

  try {
    for (const action of actions) {
      await actionExecutor.execute(action, contextData);
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
    throw err; // Re-throw to let BullMQ handle retries
  } finally {
    // We could update the execution log here to reflect actual duration
    // (Assuming we passed the execution ID, but we just created a basic log in the service).
    // For now, if it fails, it throws.
  }
  
  return { success: true, processedActions: actions.length };
};
