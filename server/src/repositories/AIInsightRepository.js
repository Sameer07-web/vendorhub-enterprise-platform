const BaseRepository = require("./BaseRepository");
const AIInsight = require("../models/AIInsight");

class AIInsightRepository extends BaseRepository {
  constructor() {
    super(AIInsight);
  }
}

module.exports = new AIInsightRepository();
