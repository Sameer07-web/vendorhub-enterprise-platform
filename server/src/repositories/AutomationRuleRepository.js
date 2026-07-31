const BaseRepository = require("./BaseRepository");
const AutomationRule = require("../models/AutomationRule");

class AutomationRuleRepository extends BaseRepository {
  constructor() {
    super(AutomationRule);
  }
}

module.exports = new AutomationRuleRepository();
