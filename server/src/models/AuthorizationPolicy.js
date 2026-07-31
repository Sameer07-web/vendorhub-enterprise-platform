const mongoose = require('mongoose');

const authorizationPolicySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    conditions: [
      {
        field: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'exists'],
          required: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    effect: {
      type: String,
      enum: ['ALLOW', 'DENY'],
      required: true,
      default: 'ALLOW',
    },
    priority: {
      type: Number,
      default: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// Indexes
authorizationPolicySchema.index({ organization: 1, resource: 1 });
authorizationPolicySchema.index({ organization: 1, enabled: 1 });

module.exports = mongoose.model('AuthorizationPolicy', authorizationPolicySchema);
