const mongoose = require('mongoose');

const automationActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'AUTO_APPROVE',
      'AUTO_REJECT',
      'SEND_NOTIFICATION',
      'SEND_EMAIL',
      'SEND_REMINDER',
      'ESCALATE',
      'CREATE_RFQ',
      'CREATE_NOTIFICATION',
      'CREATE_AUDIT_LOG',
      'CALL_WEBHOOK',
      'CREATE_TASK'
    ],
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const automationRuleSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  trigger: {
    type: String,
    required: true,
    index: true
  },
  priority: {
    type: Number,
    default: 100
  },
  stopAfterMatch: {
    type: Boolean,
    default: false
  },
  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actions: [automationActionSchema],
  version: {
    type: Number,
    default: 1
  },
  schedule: {
    type: String,
    trim: true
  },
  nextRunAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

automationRuleSchema.index({ organization: 1, name: 1 }, { unique: true });
automationRuleSchema.index({ organization: 1, isActive: 1 });
automationRuleSchema.index({ organization: 1, trigger: 1 });

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);

module.exports = AutomationRule;
