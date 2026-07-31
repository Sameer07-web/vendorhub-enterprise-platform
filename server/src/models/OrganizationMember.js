const mongoose = require('mongoose');

const organizationMemberSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Owner', 'Admin', 'Manager', 'Approver', 'Buyer', 'Viewer'],
    },
    status: {
      type: String,
      required: true,
      enum: ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'],
      default: 'INVITED',
    },
    permissionsVersion: {
      type: Number,
      default: 1,
    },
    joinedAt: {
      type: Date,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastActiveAt: {
      type: Date,
    },
    removedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: '__v', // Optimistic concurrency control
  }
);

// Indexes
organizationMemberSchema.index({ organization: 1, user: 1 }, { unique: true });
organizationMemberSchema.index({ organization: 1, role: 1 });
organizationMemberSchema.index({ organization: 1, status: 1 });

const OrganizationMember = mongoose.model('OrganizationMember', organizationMemberSchema);

module.exports = OrganizationMember;
