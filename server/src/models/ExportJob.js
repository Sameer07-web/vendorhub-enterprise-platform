const mongoose = require('mongoose');

const exportJobSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportType: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['csv', 'excel', 'pdf'],
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  recipients: {
    type: [String],
    default: []
  },
  scheduledReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledReport',
    default: null
  },
  columns: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['queued', 'waiting', 'processing', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'queued',
    index: true
  },
  progress: {
    type: Number,
    default: 0, // 0 to 100
    min: 0,
    max: 100
  },
  progressStage: {
    type: String,
    enum: ['Queued', 'Loading Data', 'Generating', 'Uploading', 'Completed', 'Failed'],
    default: 'Queued'
  },
  fileUrl: {
    type: String,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  lastRunAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

exportJobSchema.index({ organization: 1, user: 1 });
exportJobSchema.index({ organization: 1, status: 1 });
exportJobSchema.index({ organization: 1, lastRunAt: -1 });

const ExportJob = mongoose.model('ExportJob', exportJobSchema);

module.exports = ExportJob;
