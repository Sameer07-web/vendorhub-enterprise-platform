const mongoose = require('mongoose');

const organizationRoleSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    permissions: [
      {
        key: {
          type: String,
          required: true,
        },
        granted: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    permissionsVersion: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: '__v', // Optimistic concurrency control enabled
  }
);

// Indexes
organizationRoleSchema.index({ organization: 1, name: 1 }, { unique: true });
organizationRoleSchema.index({ organization: 1, status: 1 });
organizationRoleSchema.index({ organization: 1, isSystem: 1 });

module.exports = mongoose.model('OrganizationRole', organizationRoleSchema);
