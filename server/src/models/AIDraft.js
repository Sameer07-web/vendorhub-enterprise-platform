const mongoose = require('mongoose');

const aiDraftSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['PurchaseRequest', 'RFQ']
  },
  draftJson: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONSUMED'],
    default: 'PENDING'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, { timestamps: true, optimisticConcurrency: true });

// TTL index to automatically delete expired drafts
aiDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
aiDraftSchema.index({ organization: 1, status: 1 });
aiDraftSchema.index({ organization: 1, createdAt: -1 });
aiDraftSchema.index({ organization: 1, user: 1 });
aiDraftSchema.index({ user: 1 });

module.exports = mongoose.model('AIDraft', aiDraftSchema);
