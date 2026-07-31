const BaseRepository = require("./BaseRepository");
const ApprovalProcess = require("../models/ApprovalProcess");

class ApprovalProcessRepository extends BaseRepository {
  constructor() {
    super(ApprovalProcess);
  }
}

module.exports = new ApprovalProcessRepository();
