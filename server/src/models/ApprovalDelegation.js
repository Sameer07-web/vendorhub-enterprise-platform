const mongoose = require('mongoose');

const approvalDelegationSchema = new mongoose.Schema({
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

const ApprovalDelegation = mongoose.model('ApprovalDelegation', approvalDelegationSchema);

module.exports = ApprovalDelegation;
