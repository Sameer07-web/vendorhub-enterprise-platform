const BaseRepository = require("./BaseRepository");
const SavedReport = require("../models/SavedReport");

class SavedReportRepository extends BaseRepository {
  constructor() {
    super(SavedReport);
  }
}

module.exports = new SavedReportRepository();
