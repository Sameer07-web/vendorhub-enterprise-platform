const mongoose = require('mongoose');

const savedReportSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  columns: {
    type: [String],
    default: []
  },
  folder: {
    type: String,
    trim: true,
    default: 'Personal'
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  visibility: {
    type: String,
    enum: ['PRIVATE', 'TEAM', 'PUBLIC'],
    default: 'PRIVATE'
  },
  icon: {
    type: String,
    default: 'BarChart' // Default lucide icon name
  },
  color: {
    type: String,
    default: 'indigo' // Default tailwind color
  },
  version: {
    type: Number,
    default: 1
  },
  lastRunAt: {
    type: Date,
    default: null,
    index: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

savedReportSchema.index({ organization: 1, user: 1 });
savedReportSchema.index({ organization: 1, isFavorite: 1 });
savedReportSchema.index({ organization: 1, lastRunAt: -1 });

const SavedReport = mongoose.model('SavedReport', savedReportSchema);

module.exports = SavedReport;
