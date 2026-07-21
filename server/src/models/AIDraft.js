const mongoose = require('mongoose');

const aiDraftSchema = new mongoose.Schema({
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
}, { timestamps: true });

// TTL index to automatically delete expired drafts
aiDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
aiDraftSchema.index({ user: 1 });

module.exports = mongoose.model('AIDraft', aiDraftSchema);
