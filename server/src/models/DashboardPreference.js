const mongoose = require('mongoose');

const dashboardPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light'], // Only light theme for now, per user feedback, but field is prepared
    default: 'light'
  },
  density: {
    type: String,
    enum: ['compact', 'spacious'],
    default: 'spacious'
  },
  defaultRange: {
    type: String,
    default: '30d'
  },
  template: {
    type: String,
    enum: ['Executive', 'Finance', 'Procurement', 'Custom'],
    default: 'Executive'
  },
  layouts: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: []
    }
  },
  widgets: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const DashboardPreference = mongoose.model('DashboardPreference', dashboardPreferenceSchema);

module.exports = DashboardPreference;
