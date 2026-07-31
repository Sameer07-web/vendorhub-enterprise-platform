const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: String,
  logo: String,
  website: String,
  email: String,
  phone: String,
  
  // New Refinements
  industry: String,
  employeeCount: Number,
  fiscalYearStart: {
    type: String,
    default: '01-01' // MM-DD
  },
  language: {
    type: String,
    default: 'en-US'
  },
  dateFormat: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  numberFormat: {
    type: String,
    default: 'en-US'
  },

  timezone: {
    type: String,
    default: 'UTC'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  country: String,
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  
  plan: {
    type: String,
    enum: ['FREE', 'PROFESSIONAL', 'ENTERPRISE'],
    default: 'FREE'
  },
  
  status: {
    type: String,
    enum: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'ARCHIVED'],
    default: 'ACTIVE'
  },

  settings: {
    branding: {
      primaryColor: String,
      secondaryColor: String
    },
    aiEnabled: {
      type: Boolean,
      default: true
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      inAppEnabled: { type: Boolean, default: true }
    },
    defaultTheme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    procurementDefaults: {
      requiresApproval: { type: Boolean, default: true },
      defaultCurrency: { type: String, default: 'USD' }
    }
  },

  // Future Extensibility Placeholders
  featureFlags: {
    type: Map,
    of: Boolean,
    default: {}
  },
  apiKeys: [{
    name: String,
    key: String,
    createdAt: Date
  }],
  storageProvider: {
    type: String,
    enum: ['LOCAL', 'AWS_S3', 'GCS', 'AZURE_BLOB'],
    default: 'LOCAL'
  },
  integrations: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  billingCustomerId: String,

}, { timestamps: true });

// Indexes
organizationSchema.index({ slug: 1 });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ status: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
