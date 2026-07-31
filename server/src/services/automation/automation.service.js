const AutomationRuleRepository = require('../../repositories/AutomationRuleRepository');
const AutomationExecutionRepository = require('../../repositories/AutomationExecutionRepository');
const eventBus = require('./eventBus');
const conditionEvaluator = require('./conditionEvaluator');
const automationQueue = require('../../queues/automation.queue');

class AutomationService {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = (event, contextData) => {
      originalEmit(event, contextData);
      
      this.handleEvent(event, contextData).catch(err => {
        console.error(`[AutomationService] Error handling event ${event}:`, err);
      });
      return true;
    };
  }

  async handleEvent(trigger, contextData = {}) {
    const orgId = contextData.organizationId || contextData.organization;
    if (!orgId) {
      return;
    }

    const rules = await AutomationRuleRepository.findMany(
      orgId,
      { trigger, isActive: true },
      null,
      { sort: { priority: 1 } }
    );
    
    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
      const isMatch = conditionEvaluator.evaluate(rule.conditions, contextData);
      
      if (isMatch) {
        const start = Date.now();
        let status = 'SUCCESS';
        let errorMessage = null;

        try {
          await automationQueue.add('execute-rule', {
            organization: orgId,
            userId: contextData.userId || contextData.requesterId,
            correlationId: contextData.correlationId,
            jobData: {
              ruleId: rule._id,
              trigger,
              contextData,
              actions: rule.actions
            }
          });
        } catch (err) {
          status = 'FAILED';
          errorMessage = err.message;
        }

        await AutomationExecutionRepository.create(orgId, {
          ruleId: rule._id,
          trigger,
          status,
          durationMs: Date.now() - start,
          error: errorMessage,
          contextData
        });

        if (rule.stopAfterMatch) {
          break;
        }
      }
    }
  }
}

const automationService = new AutomationService();
module.exports = automationService;
