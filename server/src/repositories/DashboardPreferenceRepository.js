const BaseRepository = require("./BaseRepository");
const DashboardPreference = require("../models/DashboardPreference");

class DashboardPreferenceRepository extends BaseRepository {
  constructor() {
    super(DashboardPreference);
  }
}

module.exports = new DashboardPreferenceRepository();
