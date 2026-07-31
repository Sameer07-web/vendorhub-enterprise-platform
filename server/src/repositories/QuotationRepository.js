const BaseRepository = require("./BaseRepository");
const Quotation = require("../models/Quotation");

class QuotationRepository extends BaseRepository {
  constructor() {
    super(Quotation);
  }
}

module.exports = new QuotationRepository();
