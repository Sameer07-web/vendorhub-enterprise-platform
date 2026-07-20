const mongoose = require('mongoose');

const scheduledReportSchema = new mongoose.Schema({
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
  cronExpression: {
    type: String,
    required: true // e.g., '0 0 * * *'
  },
  recipients: {
    type: [String],
    required: true // Emails
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRunAt: {
    type: Date,
    default: null
  },
  nextRunAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const ScheduledReport = mongoose.model('ScheduledReport', scheduledReportSchema);

module.exports = ScheduledReport;
