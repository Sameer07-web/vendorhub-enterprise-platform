class ConditionEvaluator {
  /**
   * Evaluates the conditions object from an AutomationRule against the contextData.
   * @param {Object} conditions - e.g., { departmentId: '...', minAmount: 1000, priority: 'HIGH' }
   * @param {Object} contextData - e.g., { departmentId: '...', amount: 1500, priority: 'HIGH' }
   * @returns {Boolean} true if conditions are met
   */
  evaluate(conditions, contextData) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true; // No conditions means always match
    }

    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = contextData[key];

      // Handle specific logic like minAmount / maxAmount if they exist directly inside conditions
      if (key === 'minAmount') {
        if (typeof contextData.amount !== 'number' || contextData.amount < expectedValue) {
          return false;
        }
        continue;
      }
      
      if (key === 'maxAmount') {
        if (typeof contextData.amount !== 'number' || contextData.amount > expectedValue) {
          return false;
        }
        continue;
      }

      // Simple equality matching for other fields (departmentId, priority, category)
      if (actualValue?.toString() !== expectedValue?.toString()) {
        return false;
      }
    }

    return true;
  }
}

module.exports = new ConditionEvaluator();
