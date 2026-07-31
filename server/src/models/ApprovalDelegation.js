const mongoose = require('mongoose');

const approvalDelegationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  delegatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  delegateeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isPermanent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

approvalDelegationSchema.index({ organization: 1, delegatorId: 1, isActive: 1 });

const ApprovalDelegation = mongoose.model('ApprovalDelegation', approvalDelegationSchema);

module.exports = ApprovalDelegation;
