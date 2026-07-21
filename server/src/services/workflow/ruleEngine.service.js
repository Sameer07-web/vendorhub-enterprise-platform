const WorkflowRule = require('../../models/WorkflowRule');

class RuleEngineService {
  /**
   * Find the matching WorkflowRule for a given entity context.
   * @param {String} entityType e.g., 'PurchaseRequest'
   * @param {Object} contextData e.g., { departmentId, amount }
   * @returns {Object} The matched rule, or null
   */
  async findMatchingRule(entityType, contextData) {
    const { departmentId, amount } = contextData;

    // We look for active rules for this entityType where the conditions match.
    // In a real system, you might have multiple matching rules and pick the most specific one.
    // For simplicity, we find the first one that fits the amount bounds.

    const rules = await WorkflowRule.find({ 
      entityType,
      isActive: true,
      $or: [
        { 'conditions.departmentId': departmentId },
        { 'conditions.departmentId': { $exists: false } },
        { 'conditions.departmentId': null }
      ]
    });

    // Filter by amount locally (could also be done in Mongo query)
    const matchedRule = rules.find(rule => {
      const min = rule.conditions.minAmount || 0;
      const max = rule.conditions.maxAmount || Number.MAX_SAFE_INTEGER;
      
      // If amount isn't provided, we only match rules that don't care about amount
      const val = amount || 0;
      
      return val >= min && val <= max;
    });

    return matchedRule || null;
  }
}

module.exports = new RuleEngineService();
