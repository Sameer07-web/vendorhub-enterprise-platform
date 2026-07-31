const mongoose = require('mongoose');

const automationExecutionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
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
  optimisticConcurrency: true
});

automationExecutionSchema.index({ organization: 1, status: 1 });
automationExecutionSchema.index({ organization: 1, createdAt: -1 });

const AutomationExecution = mongoose.model('AutomationExecution', automationExecutionSchema);

module.exports = AutomationExecution;
