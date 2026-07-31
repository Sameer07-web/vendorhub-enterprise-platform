const BaseRepository = require("./BaseRepository");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");

class AnalyticsRepository extends BaseRepository {
  constructor() {
    super(AnalyticsSnapshot);
  }
}

module.exports = new AnalyticsRepository();
