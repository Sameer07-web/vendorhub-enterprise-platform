const mongoose = require('mongoose');

const workflowLevelSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true
  },
  approverRole: {
    type: String, // e.g. 'manager', 'director', 'admin'
    required: true
  },
  slaHours: {
    type: Number,
    default: 48
  },
  canDelegate: {
    type: Boolean,
    default: true
  },
  requireComments: {
    type: Boolean,
    default: false
  },
  autoApprove: {
    type: Boolean,
    default: false
  },
  notifyRequester: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const workflowRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  entityType: {
    type: String,
    enum: ['PurchaseRequest', 'Vendor', 'RFQ'],
    required: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdFromTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowRule',
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  // Simple Rule Conditions
  conditions: {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    }
  },
  levels: [workflowLevelSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const WorkflowRule = mongoose.model('WorkflowRule', workflowRuleSchema);

module.exports = WorkflowRule;
