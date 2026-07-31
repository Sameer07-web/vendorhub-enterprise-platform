const BaseRepository = require("./BaseRepository");
const AutomationExecution = require("../models/AutomationExecution");

class AutomationExecutionRepository extends BaseRepository {
  constructor() {
    super(AutomationExecution);
  }
}

module.exports = new AutomationExecutionRepository();
