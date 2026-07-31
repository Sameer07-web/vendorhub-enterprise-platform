const BaseRepository = require("./BaseRepository");
const AIConversation = require("../models/AIConversation");

class AIConversationRepository extends BaseRepository {
  constructor() {
    super(AIConversation);
  }
}

module.exports = new AIConversationRepository();
