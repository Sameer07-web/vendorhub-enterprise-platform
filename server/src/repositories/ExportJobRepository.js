const BaseRepository = require("./BaseRepository");
const ExportJob = require("../models/ExportJob");

class ExportJobRepository extends BaseRepository {
  constructor() {
    super(ExportJob);
  }
}

module.exports = new ExportJobRepository();
