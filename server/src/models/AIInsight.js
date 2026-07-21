const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String, // The "Why?" section
    required: true
  },
  type: {
    type: String,
    enum: ['TREND', 'ANOMALY', 'BOTTLENECK', 'PERFORMANCE', 'OPPORTUNITY', 'RISK', 'RECOMMENDATION'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'POSITIVE'],
    required: true
  },
  status: {
    type: String,
    enum: ['NEW', 'ACKNOWLEDGED', 'RESOLVED', 'ARCHIVED'],
    default: 'NEW'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  affectedModule: {
    type: String,
    required: true
  },
  actionableAdvice: {
    type: String
  },
  referenceData: {
    type: mongoose.Schema.Types.Mixed
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    enum: ['PurchaseRequest', 'Vendor', 'RFQ', 'Department', 'ApprovalProcess', 'User']
  },
  occurrences: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: String,
    default: 'SYSTEM'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index to quickly find active insights and prevent duplicates
aiInsightSchema.index({ status: 1, type: 1, affectedModule: 1 });
aiInsightSchema.index({ generatedAt: -1 });

const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

module.exports = AIInsight;
