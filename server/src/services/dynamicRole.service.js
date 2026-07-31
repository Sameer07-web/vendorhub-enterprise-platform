const OrganizationRoleRepository = require('../repositories/OrganizationRoleRepository');
const ApiError = require('../utils/ApiError');
const auditLogRepository = require('../repositories/AuditLogRepository');

class DynamicRoleService {
  /**
   * Create custom organization role
   */
  async createRole(sessionOrOrgId, { name, description, permissions = [], isDefault = false }, userId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);

    // Check duplicate name
    const exists = await OrganizationRoleRepository.exists(orgId, { name });
    if (exists) {
      throw new ApiError(400, `A role with the name "${name}" already exists in this organization.`);
    }

    // Format permissions input: if array of strings, convert to [{key, granted}]
    const formattedPermissions = permissions.map(p => {
      if (typeof p === 'string') {
        return { key: p, granted: true };
      }
      return { key: p.key, granted: p.granted !== false };
    });

    const role = await OrganizationRoleRepository.create(orgId, {
      organization: orgId,
      name,
      description,
      permissions: formattedPermissions,
      isSystem: false,
      isDefault,
      status: 'ACTIVE',
      createdBy: userId,
      updatedBy: userId,
    });

    await auditLogRepository.create(orgId, {
      user: userId,
      action: 'ROLE_CREATED',
      entityType: 'OrganizationRole',
      entityId: role._id,
      newValue: { name, description, permissions: formattedPermissions }
    });

    return role;
  }

  /**
   * Update custom organization role
   */
  async updateRole(sessionOrOrgId, roleId, { name, description, permissions, isDefault }, userId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);

    const role = await OrganizationRoleRepository.findOne(orgId, { _id: roleId });
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    if (role.isSystem) {
      throw new ApiError(400, 'Protected system roles cannot be modified.');
    }

    const oldValue = { name: role.name, description: role.description, permissions: role.permissions };

    if (name && name !== role.name) {
      const exists = await OrganizationRoleRepository.exists(orgId, { name, _id: { $ne: roleId } });
      if (exists) {
        throw new ApiError(400, `A role with the name "${name}" already exists.`);
      }
      role.name = name;
    }

    if (description !== undefined) role.description = description;
    if (isDefault !== undefined) role.isDefault = isDefault;

    if (permissions) {
      const formattedPermissions = permissions.map(p => {
        if (typeof p === 'string') {
          return { key: p, granted: true };
        }
        return { key: p.key, granted: p.granted !== false };
      });
      role.permissions = formattedPermissions;
      role.permissionsVersion += 1;
    }

    role.updatedBy = userId;
    await role.save();

    await auditLogRepository.create(orgId, {
      user: userId,
      action: 'ROLE_UPDATED',
      entityType: 'OrganizationRole',
      entityId: role._id,
      oldValue,
      newValue: { name: role.name, description: role.description, permissions: role.permissions }
    });

    return role;
  }

  /**
   * Clone role
   */
  async cloneRole(sessionOrOrgId, roleId, newName, userId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);

    const sourceRole = await OrganizationRoleRepository.findOne(orgId, { _id: roleId });
    if (!sourceRole) {
      throw new ApiError(404, 'Source role not found');
    }

    const exists = await OrganizationRoleRepository.exists(orgId, { name: newName });
    if (exists) {
      throw new ApiError(400, `A role with the name "${newName}" already exists.`);
    }

    // Map permissions
    const permissions = sourceRole.permissions.map(p => ({ key: p.key, granted: p.granted }));

    const role = await OrganizationRoleRepository.create(orgId, {
      organization: orgId,
      name: newName,
      description: `Cloned from ${sourceRole.name}. ${sourceRole.description || ''}`,
      permissions,
      isSystem: false,
      isDefault: false,
      status: 'ACTIVE',
      createdBy: userId,
      updatedBy: userId,
    });

    await auditLogRepository.create(orgId, {
      user: userId,
      action: 'ROLE_CREATED',
      entityType: 'OrganizationRole',
      entityId: role._id,
      newValue: { name: newName, permissions }
    });

    return role;
  }

  /**
   * Archive role
   */
  async archiveRole(sessionOrOrgId, roleId, userId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);

    const role = await OrganizationRoleRepository.findOne(orgId, { _id: roleId });
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    if (role.isSystem) {
      throw new ApiError(400, 'Protected system roles cannot be archived.');
    }

    role.status = 'ARCHIVED';
    role.updatedBy = userId;
    await role.save();

    await auditLogRepository.create(orgId, {
      user: userId,
      action: 'ROLE_ARCHIVED',
      entityType: 'OrganizationRole',
      entityId: role._id,
      newValue: { status: 'ARCHIVED' }
    });

    return role;
  }

  /**
   * Restore role
   */
  async restoreRole(sessionOrOrgId, roleId, userId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);

    const role = await OrganizationRoleRepository.findOne(orgId, { _id: roleId });
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    role.status = 'ACTIVE';
    role.updatedBy = userId;
    await role.save();

    await auditLogRepository.create(orgId, {
      user: userId,
      action: 'ROLE_RESTORED',
      entityType: 'OrganizationRole',
      entityId: role._id,
      newValue: { status: 'ACTIVE' }
    });

    return role;
  }

  /**
   * Seed default system roles
   */
  async seedDefaultRoles(sessionOrOrgId, creatorUserId = null) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);
    const { RolePermissions } = require('../constants/permissions.registry');

    const createdRoles = [];
    for (const [roleName, permissionKeys] of Object.entries(RolePermissions)) {
      const exists = await OrganizationRoleRepository.exists(orgId, { name: roleName });
      if (!exists) {
        const formattedPermissions = permissionKeys.map(key => ({ key, granted: true }));
        const role = await OrganizationRoleRepository.create(orgId, {
          organization: orgId,
          name: roleName,
          description: `System defined ${roleName} role.`,
          permissions: formattedPermissions,
          isSystem: true,
          isDefault: roleName === 'Viewer',
          status: 'ACTIVE',
          createdBy: creatorUserId,
          updatedBy: creatorUserId,
        });
        createdRoles.push(role);
      }
    }
    return createdRoles;
  }

  /**
   * Assign role to member
   */
  async assignRoleToMember(sessionOrOrgId, memberId, roleId, assignedByUserId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);
    const OrganizationMemberRoleRepository = require('../repositories/OrganizationMemberRoleRepository');

    // Verify role exists and belongs to organization
    const role = await OrganizationRoleRepository.findOne(orgId, { _id: roleId, status: 'ACTIVE' });
    if (!role) {
      throw new ApiError(404, 'Active role not found');
    }

    // Verify assignment doesn't duplicate
    const exists = await OrganizationMemberRoleRepository.exists(orgId, { member: memberId, role: roleId });
    if (exists) {
      return { message: 'Role is already assigned to this member' };
    }

    const assignment = await OrganizationMemberRoleRepository.create(orgId, {
      organization: orgId,
      member: memberId,
      role: roleId,
      assignedBy: assignedByUserId,
      assignedAt: new Date(),
    });

    await auditLogRepository.create(orgId, {
      user: assignedByUserId,
      action: 'ROLE_ASSIGNED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      newValue: { roleId, roleName: role.name }
    });

    return assignment;
  }

  /**
   * Remove role from member
   */
  async removeRoleFromMember(sessionOrOrgId, memberId, roleId, removedByUserId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);
    const OrganizationMemberRoleRepository = require('../repositories/OrganizationMemberRoleRepository');

    const assignment = await OrganizationMemberRoleRepository.findOne(orgId, { member: memberId, role: roleId });
    if (!assignment) {
      throw new ApiError(404, 'Role assignment not found');
    }

    await OrganizationMemberRoleRepository.delete(orgId, assignment._id);

    await auditLogRepository.create(orgId, {
      user: removedByUserId,
      action: 'ROLE_REMOVED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      newValue: { roleId }
    });

    return { success: true };
  }

  /**
   * Get roles assigned to member
   */
  async getMemberRoles(sessionOrOrgId, memberId) {
    const orgId = OrganizationRoleRepository._extractOrgId(sessionOrOrgId);
    const OrganizationMemberRoleRepository = require('../repositories/OrganizationMemberRoleRepository');

    const assignments = await OrganizationMemberRoleRepository.findMany(orgId, { member: memberId }, null, {
      populate: { path: 'role' }
    });
    return assignments.map(a => a.role).filter(Boolean);
  }
}

module.exports = new DynamicRoleService();
