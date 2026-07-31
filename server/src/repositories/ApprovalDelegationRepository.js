const BaseRepository = require("./BaseRepository");
const ApprovalDelegation = require("../models/ApprovalDelegation");

class ApprovalDelegationRepository extends BaseRepository {
  constructor() {
    super(ApprovalDelegation);
  }
}

module.exports = new ApprovalDelegationRepository();
