const { RolePermissions } = require('../constants/permissions.registry');
const OrganizationMemberRepository = require('../repositories/OrganizationMemberRepository');
const OrganizationMemberRoleRepository = require('../repositories/OrganizationMemberRoleRepository');
const policyEngineService = require('./policyEngine.service');
const ApiError = require('../utils/ApiError');

class AuthorizationService {
  /**
   * Check if a member has a specific role (checks dynamic roles, falls back to static)
   */
  async hasRole(member, roleName) {
    if (!member || member.status !== 'ACTIVE') return false;

    // Check dynamic roles first
    const assignments = await OrganizationMemberRoleRepository.findMany(member.organization, { member: member._id }, null, {
      populate: { path: 'role' }
    });

    if (assignments.length > 0) {
      return assignments.some(a => a.role && a.role.name === roleName && a.role.status === 'ACTIVE');
    }

    // Fallback to static legacy role on membership
    return member.role === roleName;
  }

  /**
   * Check if a member has a specific permission via Policy Engine
   */
  async hasPermission(member, permission, context = {}, resourceInstance = null) {
    if (!member || member.status !== 'ACTIVE') return false;

    // Split 'vendors:view' to resource = 'vendors', action = 'view'
    const parts = permission.split(':');
    const resource = parts[0];
    const action = parts[1] || '*';

    // Build default evaluation context
    const evalContext = {
      user: {
        _id: member.user,
        department: member.department,
        ...context.user
      },
      ...context
    };

    const decision = await policyEngineService.evaluate(
      member.organization,
      member,
      resource,
      action,
      evalContext,
      resourceInstance
    );

    return decision.allowed;
  }

  /**
   * Throw if member lacks target role
   */
  async requireRole(member, role) {
    const authorized = await this.hasRole(member, role);
    if (!authorized) {
      throw new ApiError(403, `Access Denied: Requires role ${role}`);
    }
  }

  /**
   * Throw if member lacks target permission
   */
  async requirePermission(member, permission, context = {}, resourceInstance = null) {
    const authorized = await this.hasPermission(member, permission, context, resourceInstance);
    if (!authorized) {
      throw new ApiError(403, `Access Denied: Insufficient permissions for action: ${permission}`);
    }
  }

  /**
   * Check if member is the Owner
   */
  async isOrganizationOwner(member) {
    return await this.hasRole(member, 'Owner');
  }

  /**
   * Resolves the active membership of a user in an organization
   */
  async resolveMembership(organizationId, userId) {
    return await OrganizationMemberRepository.findOne(organizationId, {
      user: userId,
      status: 'ACTIVE'
    });
  }
}

module.exports = new AuthorizationService();
