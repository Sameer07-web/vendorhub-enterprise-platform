const OrganizationMemberRepository = require('../repositories/OrganizationMemberRepository');
const ApiError = require('../utils/ApiError');
const auditLogRepository = require('../repositories/AuditLogRepository');
const notificationService = require('./notification.service');
const User = require('../models/User');

class OrganizationAdminService {
  /**
   * List members of an organization
   */
  async listMembers(sessionOrOrgId, filters = {}) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);
    return await OrganizationMemberRepository.findMany(orgId, filters, null, {
      populate: { path: 'user', select: 'fullName email isActive' }
    });
  }

  /**
   * Update role of a member
   */
  async updateRole(sessionOrOrgId, memberId, newRole, updatedByUserId) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);

    const member = await OrganizationMemberRepository.findOne(orgId, { _id: memberId });
    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'Owner') {
      throw new ApiError(400, 'Cannot update owner role directly. Use transfer ownership instead.');
    }

    const oldRole = member.role;
    member.role = newRole;
    member.permissionsVersion += 1;
    await member.save();

    await auditLogRepository.create(orgId, {
      user: updatedByUserId,
      action: 'ROLE_CHANGED',
      entityType: 'OrganizationMember',
      entityId: member._id,
      newValue: { oldRole, newRole, targetUserId: member.user }
    });

    await notificationService.createNotification(orgId, {
      recipient: member.user,
      type: 'SYSTEM',
      title: 'Role Updated',
      message: `Your organization role has been changed from ${oldRole} to ${newRole}.`,
      priority: 'HIGH'
    });

    return member;
  }

  /**
   * Suspend a member
   */
  async suspendMember(sessionOrOrgId, memberId, suspendedByUserId) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);

    const member = await OrganizationMemberRepository.findOne(orgId, { _id: memberId });
    if (!member || member.status === 'REMOVED') {
      throw new ApiError(404, 'Active member not found');
    }

    if (member.role === 'Owner') {
      throw new ApiError(400, 'Cannot suspend the organization Owner.');
    }

    member.status = 'SUSPENDED';
    await member.save();

    // Disable User account
    await User.findByIdAndUpdate(member.user, { isActive: false });

    await auditLogRepository.create(orgId, {
      user: suspendedByUserId,
      action: 'MEMBERSHIP_SUSPENDED',
      entityType: 'OrganizationMember',
      entityId: member._id,
      newValue: { targetUserId: member.user }
    });

    await notificationService.createNotification(orgId, {
      recipient: member.user,
      type: 'SYSTEM',
      title: 'Membership Suspended',
      message: 'Your organization membership has been suspended.',
      priority: 'CRITICAL'
    });

    return member;
  }

  /**
   * Reactivate suspended member
   */
  async reactivateMember(sessionOrOrgId, memberId, activatedByUserId) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);

    const member = await OrganizationMemberRepository.findOne(orgId, { _id: memberId });
    if (!member || member.status !== 'SUSPENDED') {
      throw new ApiError(404, 'Suspended member not found');
    }

    member.status = 'ACTIVE';
    await member.save();

    // Re-enable User account
    await User.findByIdAndUpdate(member.user, { isActive: true });

    await auditLogRepository.create(orgId, {
      user: activatedByUserId,
      action: 'MEMBERSHIP_REACTIVATED',
      entityType: 'OrganizationMember',
      entityId: member._id,
      newValue: { targetUserId: member.user }
    });

    return member;
  }

  /**
   * Remove member from organization
   */
  async removeMember(sessionOrOrgId, memberId, removedByUserId) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);

    const member = await OrganizationMemberRepository.findOne(orgId, { _id: memberId });
    if (!member || member.status === 'REMOVED') {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'Owner') {
      throw new ApiError(400, 'Cannot remove the organization Owner.');
    }

    member.status = 'REMOVED';
    member.removedAt = new Date();
    await member.save();

    // Unassociate user organization link
    await User.findByIdAndUpdate(member.user, { organization: null, isActive: false });

    await auditLogRepository.create(orgId, {
      user: removedByUserId,
      action: 'MEMBER_REMOVED',
      entityType: 'OrganizationMember',
      entityId: member._id,
      newValue: { targetUserId: member.user }
    });

    await notificationService.createNotification(orgId, {
      recipient: member.user,
      type: 'SYSTEM',
      title: 'Membership Removed',
      message: 'You have been removed from the organization.',
      priority: 'CRITICAL'
    });

    return member;
  }

  /**
   * Transfer ownership (Owner only action)
   */
  async transferOwnership(sessionOrOrgId, currentOwnerMember, targetMemberId) {
    const orgId = OrganizationMemberRepository._extractOrgId(sessionOrOrgId);

    if (currentOwnerMember.role !== 'Owner') {
      throw new ApiError(403, 'Only the organization Owner can transfer ownership.');
    }

    const targetMember = await OrganizationMemberRepository.findOne(orgId, { _id: targetMemberId, status: 'ACTIVE' });
    if (!targetMember) {
      throw new ApiError(404, 'Active target member not found');
    }

    // Downgrade current Owner to Admin
    currentOwnerMember.role = 'Admin';
    currentOwnerMember.permissionsVersion += 1;
    await currentOwnerMember.save();

    // Upgrade target Member to Owner
    targetMember.role = 'Owner';
    targetMember.permissionsVersion += 1;
    await targetMember.save();

    // Update organization owner link
    const Organization = require('../models/Organization');
    await Organization.findByIdAndUpdate(orgId, { owner: targetMember.user });

    await auditLogRepository.create(orgId, {
      user: currentOwnerMember.user,
      action: 'OWNERSHIP_TRANSFERRED',
      entityType: 'OrganizationMember',
      entityId: targetMember._id,
      newValue: { fromUserId: currentOwnerMember.user, toUserId: targetMember.user }
    });

    return { previousOwner: currentOwnerMember, newOwner: targetMember };
  }
}

module.exports = new OrganizationAdminService();
