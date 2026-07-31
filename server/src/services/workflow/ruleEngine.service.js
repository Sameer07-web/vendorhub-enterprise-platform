const WorkflowRuleRepository = require('../../repositories/WorkflowRuleRepository');

class RuleEngineService {
  /**
   * Find the matching WorkflowRule for a given entity context.
   */
  async findMatchingRule(sessionOrOrgId, entityType, contextData) {
    const { departmentId, amount } = contextData;

    const rules = await WorkflowRuleRepository.findMany(sessionOrOrgId, { 
      entityType,
      isActive: true,
      $or: [
        { 'conditions.departmentId': departmentId },
        { 'conditions.departmentId': { $exists: false } },
        { 'conditions.departmentId': null }
      ]
    });

    const matchedRule = rules.find(rule => {
      const min = rule.conditions?.minAmount || 0;
      const max = rule.conditions?.maxAmount || Number.MAX_SAFE_INTEGER;
      const val = amount || 0;
      return val >= min && val <= max;
    });

    return matchedRule || null;
  }
}

module.exports = new RuleEngineService();
