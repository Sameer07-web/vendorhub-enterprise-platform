const BaseRepository = require("./BaseRepository");
const AIDocumentExtraction = require("../models/AIDocumentExtraction");

class AIDocumentExtractionRepository extends BaseRepository {
  constructor() {
    super(AIDocumentExtraction);
  }
}

module.exports = new AIDocumentExtractionRepository();
