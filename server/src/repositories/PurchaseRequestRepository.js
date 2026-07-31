const BaseRepository = require("./BaseRepository");
const PurchaseRequest = require("../models/PurchaseRequest");

class PurchaseRequestRepository extends BaseRepository {
  constructor() {
    super(PurchaseRequest);
  }
}

module.exports = new PurchaseRequestRepository();
