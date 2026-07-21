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
  name: {
    type: String,
    required: true,
    unique: true,
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
    // e.g., 'WORKFLOW_STARTED', 'SLA_WARNING', 'SLA_BREACHED', 'PR_CREATED'
  },
  priority: {
    type: Number,
    default: 100 // Lower number = higher priority (executes first)
  },
  stopAfterMatch: {
    type: Boolean,
    default: false
  },
  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // e.g., { departmentId: '...', minAmount: 1000, priority: 'HIGH' }
  },
  actions: [automationActionSchema],
  version: {
    type: Number,
    default: 1
  },
  schedule: {
    type: String, // Cron expression
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
  versionKey: false
});

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);

module.exports = AutomationRule;
