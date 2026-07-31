const BaseRepository = require("./BaseRepository");
const ScheduledReport = require("../models/ScheduledReport");

class ScheduledReportRepository extends BaseRepository {
  constructor() {
    super(ScheduledReport);
  }
}

module.exports = new ScheduledReportRepository();
