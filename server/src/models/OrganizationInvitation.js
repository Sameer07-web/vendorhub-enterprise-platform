const mongoose = require('mongoose');

const organizationInvitationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Owner', 'Admin', 'Manager', 'Approver', 'Buyer', 'Viewer'],
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
organizationInvitationSchema.index({ organization: 1, email: 1 });
organizationInvitationSchema.index({ organization: 1, status: 1 });
organizationInvitationSchema.index({ invitationToken: 1 });
organizationInvitationSchema.index({ expiresAt: 1 });

const OrganizationInvitation = mongoose.model('OrganizationInvitation', organizationInvitationSchema);

module.exports = OrganizationInvitation;
