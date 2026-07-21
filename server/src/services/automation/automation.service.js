const AutomationRule = require('../../models/AutomationRule');
const AutomationExecution = require('../../models/AutomationExecution');
const eventBus = require('./eventBus');
const conditionEvaluator = require('./conditionEvaluator');
const automationQueue = require('../../queues/automation.queue');

class AutomationService {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    // We listen to all events emitted on the eventBus
    // By using a wildcard or explicit binding. 
    // Since EventEmitter doesn't support wildcard out of the box easily,
    // we'll explicitly map known events, or we can just override `emit`.
    // For now, we'll patch eventBus.emit to intercept everything.
    
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = (event, contextData) => {
      // Fire normal listeners if any
      originalEmit(event, contextData);
      
      // Hook into automation evaluation
      this.handleEvent(event, contextData).catch(err => {
        console.error(`[AutomationService] Error handling event ${event}:`, err);
      });
      return true;
    };
  }

  async handleEvent(trigger, contextData) {
    // 1. Fetch active rules for this trigger, ordered by priority (lowest first)
    const rules = await AutomationRule.find({ trigger, isActive: true }).sort({ priority: 1 });
    
    if (!rules || rules.length === 0) return;

    // 2. Evaluate and Execute
    for (const rule of rules) {
      const isMatch = conditionEvaluator.evaluate(rule.conditions, contextData);
      
      if (isMatch) {
        // Evaluate matched rule
        const start = Date.now();
        let status = 'SUCCESS';
        let errorMessage = null;

        try {
          // Enqueue or execute directly? 
          // For resilience, we enqueue it in BullMQ to handle retries and isolated execution.
          await automationQueue.add('execute-rule', {
            ruleId: rule._id,
            trigger,
            contextData,
            actions: rule.actions
          });
          
          // Note: The actual execution time and status will be logged by the processor.
          // But we can log a 'QUEUED' or 'SUCCESS' for the dispatch here.
          
        } catch (err) {
          status = 'FAILED';
          errorMessage = err.message;
        }

        // Log the execution (or dispatch) attempt
        await AutomationExecution.create({
          ruleId: rule._id,
          trigger,
          status,
          durationMs: Date.now() - start,
          error: errorMessage,
          contextData
        });

        if (rule.stopAfterMatch) {
          break; // Do not evaluate subsequent rules
        }
      }
    }
  }
}

// Instantiate to bind listeners
const automationService = new AutomationService();
module.exports = automationService;
