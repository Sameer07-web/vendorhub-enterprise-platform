const BaseRepository = require("./BaseRepository");
const WorkflowRule = require("../models/WorkflowRule");

class WorkflowRuleRepository extends BaseRepository {
  constructor() {
    super(WorkflowRule);
  }
}

module.exports = new WorkflowRuleRepository();
