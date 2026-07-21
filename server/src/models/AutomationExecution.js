const mongoose = require('mongoose');

const automationExecutionSchema = new mongoose.Schema({
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationRule',
    required: true,
    index: true
  },
  trigger: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  durationMs: {
    type: Number,
    required: true
  },
  error: {
    type: String
  },
  contextData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  versionKey: false
});

const AutomationExecution = mongoose.model('AutomationExecution', automationExecutionSchema);

module.exports = AutomationExecution;
