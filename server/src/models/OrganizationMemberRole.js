const mongoose = require('mongoose');

const organizationMemberRoleSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationMember',
      required: true,
      index: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationRole',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// Indexes
organizationMemberRoleSchema.index({ organization: 1, member: 1 });
organizationMemberRoleSchema.index({ organization: 1, role: 1 });

module.exports = mongoose.model('OrganizationMemberRole', organizationMemberRoleSchema);
