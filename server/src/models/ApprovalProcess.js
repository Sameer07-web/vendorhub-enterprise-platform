const mongoose = require('mongoose');

const approvalHistorySchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: [
      'SUBMITTED', 
      'APPROVED', 
      'REJECTED', 
      'ESCALATED', 
      'DELEGATED', 
      'REASSIGNED', 
      'REMINDER_SENT', 
      'SLA_BREACHED'
    ],
    required: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: {
    type: String
  },
  actionDate: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const approvalProcessSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['PurchaseRequest', 'Vendor', 'RFQ'],
    required: true,
    index: true
  },
  workflowRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowRule',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  currentSequence: {
    type: Number,
    default: 10
  },
  pendingApprovers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  currentStageStartedAt: {
    type: Date,
    default: Date.now
  },
  slaDeadline: {
    type: Date,
    default: null
  },
  history: [approvalHistorySchema]
}, {
  timestamps: true,
  versionKey: false
});

const ApprovalProcess = mongoose.model('ApprovalProcess', approvalProcessSchema);

module.exports = ApprovalProcess;
