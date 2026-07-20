const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema({
  snapshotType: {
    type: String,
    required: true,
    enum: ['spend', 'vendor', 'po', 'rfq', 'system'],
    index: true
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for querying the latest snapshot of a specific type and period
analyticsSnapshotSchema.index({ snapshotType: 1, period: 1, generatedAt: -1 });

// Optional: Add TTL index to automatically delete expired snapshots
analyticsSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

module.exports = AnalyticsSnapshot;
