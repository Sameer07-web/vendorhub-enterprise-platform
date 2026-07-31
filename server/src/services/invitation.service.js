const crypto = require('crypto');
const OrganizationInvitationRepository = require('../repositories/OrganizationInvitationRepository');
const OrganizationMemberRepository = require('../repositories/OrganizationMemberRepository');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const auditLogRepository = require('../repositories/AuditLogRepository');
const notificationService = require('./notification.service');

class InvitationService {
  /**
   * Send/Create organization invitation
   */
  async inviteUser(sessionOrOrgId, email, role, invitedByUserId) {
    const orgId = OrganizationInvitationRepository._extractOrgId(sessionOrOrgId);
    const cleanedEmail = email.toLowerCase().trim();

    // 1. Check duplicate pending invites
    const existingInvite = await OrganizationInvitationRepository.findOne(orgId, {
      email: cleanedEmail,
      status: 'PENDING',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      throw new ApiError(400, 'A pending invitation already exists for this email address.');
    }

    // 2. Check if user is already a member
    const existingMember = await OrganizationMemberRepository.findOne(orgId, {
      user: await User.findOne({ email: cleanedEmail }).select('_id'),
      status: { $in: ['ACTIVE', 'INVITED'] }
    });

    if (existingMember) {
      throw new ApiError(400, 'This user is already a member or invited to this organization.');
    }

    // 3. Generate token & expires (24h)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await OrganizationInvitationRepository.create(orgId, {
      email: cleanedEmail,
      role,
      invitationToken: token,
      expiresAt,
      invitedBy: invitedByUserId,
      status: 'PENDING'
    });

    // 4. Record Audit Log
    await auditLogRepository.create(orgId, {
      user: invitedByUserId,
      action: 'INVITATION_SENT',
      entityType: 'OrganizationInvitation',
      entityId: invitation._id,
      newValue: { email: cleanedEmail, role }
    });

    // 5. Generate Notification (System/Tenant Scoped)
    await notificationService.createNotification(orgId, {
      recipient: invitedByUserId, // Notify the inviter
      type: 'SYSTEM',
      title: 'Invitation Sent',
      message: `Invitation successfully sent to ${cleanedEmail} with role ${role}.`,
      priority: 'LOW'
    });

    return invitation;
  }

  /**
   * Resend invitation
   */
  async resendInvitation(sessionOrOrgId, invitationId, resentByUserId) {
    const orgId = OrganizationInvitationRepository._extractOrgId(sessionOrOrgId);

    const invitation = await OrganizationInvitationRepository.findOne(orgId, { _id: invitationId });
    if (!invitation || invitation.status !== 'PENDING') {
      throw new ApiError(404, 'Invitation not found or invalid status');
    }

    // Refresh expiration & update token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    invitation.invitationToken = token;
    invitation.expiresAt = expiresAt;
    await invitation.save();

    await auditLogRepository.create(orgId, {
      user: resentByUserId,
      action: 'INVITATION_RESENT',
      entityType: 'OrganizationInvitation',
      entityId: invitation._id,
      newValue: { email: invitation.email }
    });

    return invitation;
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(sessionOrOrgId, invitationId, revokedByUserId) {
    const orgId = OrganizationInvitationRepository._extractOrgId(sessionOrOrgId);

    const invitation = await OrganizationInvitationRepository.findOne(orgId, { _id: invitationId });
    if (!invitation || invitation.status !== 'PENDING') {
      throw new ApiError(404, 'Invitation not found or invalid status');
    }

    invitation.status = 'REVOKED';
    invitation.revokedAt = new Date();
    await invitation.save();

    await auditLogRepository.create(orgId, {
      user: revokedByUserId,
      action: 'INVITATION_REVOKED',
      entityType: 'OrganizationInvitation',
      entityId: invitation._id,
      newValue: { email: invitation.email }
    });

    return invitation;
  }

  /**
   * Accept invitation and create member
   */
  async acceptInvitation(token, password, fullName) {
    // Note: Finding invite requires bypassing organization scopes because the user is not yet logged in/associated.
    const invitation = await OrganizationInvitationRepository.model.findOne({
      invitationToken: token,
      status: 'PENDING'
    });

    if (!invitation) {
      throw new ApiError(400, 'Invalid or already accepted invitation token.');
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new ApiError(400, 'This invitation token has expired.');
    }

    // 1. Find or create user
    let user = await User.findOne({ email: invitation.email });
    if (!user) {
      user = await User.create({
        fullName,
        email: invitation.email,
        password,
        organization: invitation.organization,
        isActive: true,
      });
    } else {
      user.organization = invitation.organization;
      await user.save();
    }

    // 2. Create OrganizationMember
    const member = await OrganizationMemberRepository.create(invitation.organization, {
      user: user._id,
      role: invitation.role,
      status: 'ACTIVE',
      joinedAt: new Date(),
      invitedBy: invitation.invitedBy
    });

    // 3. Mark invite accepted
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // 4. Audit Log
    await auditLogRepository.create(invitation.organization, {
      user: user._id,
      action: 'INVITATION_ACCEPTED',
      entityType: 'OrganizationMember',
      entityId: member._id,
      newValue: { email: invitation.email, role: invitation.role }
    });

    // 5. Trigger notifications to inviter
    await notificationService.createNotification(invitation.organization, {
      recipient: invitation.invitedBy,
      type: 'SYSTEM',
      title: 'Invitation Accepted',
      message: `${fullName} has joined your organization as ${invitation.role}.`,
      priority: 'MEDIUM'
    });

    return { user, member };
  }
}

module.exports = new InvitationService();
