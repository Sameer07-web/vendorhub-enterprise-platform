const BaseRepository = require("./BaseRepository");
const AIDraft = require("../models/AIDraft");

class AIDraftRepository extends BaseRepository {
  constructor() {
    super(AIDraft);
  }
}

module.exports = new AIDraftRepository();
