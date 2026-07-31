const BaseRepository = require("./BaseRepository");
const RFQ = require("../models/RFQ");

class RFQRepository extends BaseRepository {
  constructor() {
    super(RFQ);
  }
}

module.exports = new RFQRepository();
