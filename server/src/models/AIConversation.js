const mongoose = require('mongoose');

const toolCallSchema = new mongoose.Schema({
  toolName: { type: String, required: true },
  arguments: { type: mongoose.Schema.Types.Mixed },
  result: { type: mongoose.Schema.Types.Mixed },
  latencyMs: { type: Number },
  success: { type: Boolean, default: true },
  errorMessage: { type: String }
}, { _id: false });

const aiConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true,
    default: 'gemini-2.5-flash'
  },
  toolCalls: [toolCallSchema],
  latencyMs: {
    type: Number
  },
  tokens: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  success: {
    type: Boolean,
    default: true
  },
  errorDetails: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for auditing and analytics
aiConversationSchema.index({ user: 1, createdAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

module.exports = AIConversation;
