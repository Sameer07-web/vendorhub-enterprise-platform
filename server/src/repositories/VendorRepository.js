const BaseRepository = require("./BaseRepository");
const Vendor = require("../models/Vendor");

class VendorRepository extends BaseRepository {
  constructor() {
    super(Vendor);
  }
}

module.exports = new VendorRepository();
