const mongoose = require('mongoose');
const AuthorizationPolicyRepository = require('../repositories/AuthorizationPolicyRepository');
const OrganizationRoleRepository = require('../repositories/OrganizationRoleRepository');
const OrganizationMemberRoleRepository = require('../repositories/OrganizationMemberRoleRepository');
const { RolePermissions } = require('../constants/permissions.registry');
const cacheService = require('../utils/cache'); // In-process cache with Redis-compatible interface

class PolicyEngineService {
  /**
   * Future ABAC Attribute Evaluation Hook
   */
  evaluateAttributes(context, resourceInstance, condition) {
    const { field, operator, value } = condition;
    const { user } = context;

    // Retrieve field value from resourceInstance or context user
    let actualValue = resourceInstance ? resourceInstance[field] : undefined;
    if (actualValue === undefined && user) {
      actualValue = user[field];
    }

    // Resolve dynamic values like '$user._id' or '$user.department'
    let resolvedValue = value;
    if (typeof value === 'string' && value.startsWith('$user.')) {
      const userField = value.replace('$user.', '');
      resolvedValue = user ? user[userField] : undefined;
    }

    if (actualValue instanceof mongoose?.Types?.ObjectId || (actualValue && actualValue.toString)) {
      actualValue = actualValue.toString();
    }
    if (resolvedValue instanceof mongoose?.Types?.ObjectId || (resolvedValue && resolvedValue.toString)) {
      resolvedValue = resolvedValue.toString();
    }

    switch (operator) {
      case 'equals':
        return actualValue === resolvedValue;
      case 'not_equals':
        return actualValue !== resolvedValue;
      case 'greater_than':
        return Number(actualValue) > Number(resolvedValue);
      case 'less_than':
        return Number(actualValue) < Number(resolvedValue);
      case 'contains':
        return Array.isArray(actualValue) ? actualValue.includes(resolvedValue) : String(actualValue).includes(String(resolvedValue));
      case 'in':
        return Array.isArray(resolvedValue) ? resolvedValue.includes(actualValue) : false;
      case 'exists':
        return actualValue !== undefined && actualValue !== null;
      default:
        return false;
    }
  }

  /**
   * Evaluate active permission set & policy constraints
   */
  async evaluate(sessionOrOrgId, member, resource, action, context = {}, resourceInstance = null) {
    const orgId = AuthorizationPolicyRepository._extractOrgId(sessionOrOrgId);
    const evaluatedAt = new Date();

    // 1. Resolve Permissions via Dynamic Roles assigned to the Member
    const assignedRoles = await OrganizationMemberRoleRepository.findMany(orgId, { member: member._id }, null, {
      populate: { path: 'role' }
    });

    let permissions = [];
    let isOwner = false;

    if (assignedRoles.length > 0) {
      for (const assignment of assignedRoles) {
        const role = assignment.role;
        if (role && role.status === 'ACTIVE') {
          if (role.name === 'Owner') isOwner = true;
          // Merge granted permissions
          role.permissions.forEach(p => {
            if (p.granted && !permissions.includes(p.key)) {
              permissions.push(p.key);
            }
          });
        }
      }
    } else {
      // Fallback to static member.role definitions if no dynamic roles are assigned yet
      const staticRole = member.role;
      if (staticRole === 'Owner') isOwner = true;
      const staticPermissions = RolePermissions[staticRole] || [];
      permissions = [...staticPermissions];
    }

    // Owner role automatically bypasses all policies (implicit allow)
    if (isOwner) {
      return {
        allowed: true,
        matchedPolicy: 'ImplicitOwnerRole',
        reason: 'Organization Owner has unrestricted access.',
        evaluatedAt
      };
    }

    // Check if the permission key is present (e.g. "vendors:view" or generic "vendors:create")
    const targetPermission = `${resource}:${action}`;
    if (!permissions.includes(targetPermission)) {
      return {
        allowed: false,
        matchedPolicy: 'DefaultDeny',
        reason: `Lacks required permission key: ${targetPermission}`,
        evaluatedAt
      };
    }

    // 2. Fetch Policies from cache or database
    let policies = [];
    const cacheKey = `organization:${orgId}:policies`;
    const isTest = process.env.NODE_ENV === 'test';
    
    if (!isTest) {
      try {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          policies = cached;
        }
      } catch (err) {
        console.warn('[PolicyEngine] Cache read failed, falling back to DB:', err.message);
      }
    }

    if (policies.length === 0) {
      policies = await AuthorizationPolicyRepository.findMany(orgId, { enabled: true });
      if (!isTest) {
        try {
          await cacheService.set(cacheKey, policies, 3600); // TTL: 1 hour
        } catch (err) {
          console.warn('[PolicyEngine] Cache write failed:', err.message);
        }
      }
    }

    // Filter policies matching this specific resource and action
    const matchingPolicies = policies.filter(p => {
      return p.resource === resource && (p.action === action || p.action === '*');
    });

    if (matchingPolicies.length === 0) {
      return {
        allowed: true,
        matchedPolicy: 'DefaultAllowPermissionGranted',
        reason: 'Permission granted by role with no restricting policies.',
        evaluatedAt
      };
    }

    // Sort matching policies by:
    // 1. Priority (descending)
    // 2. Effect (DENY wins over ALLOW on tie)
    // 3. Created time (Newer wins over older on tie)
    matchingPolicies.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      if (a.effect !== b.effect) {
        return a.effect === 'DENY' ? -1 : 1; // Deny wins tie-breaker
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Newer wins tie-breaker
    });

    // Evaluate policies sequentially
    for (const policy of matchingPolicies) {
      let conditionsMatch = true;

      if (policy.conditions && policy.conditions.length > 0) {
        for (const condition of policy.conditions) {
          if (!this.evaluateAttributes(context, resourceInstance, condition)) {
            conditionsMatch = false;
            break;
          }
        }
      }

      if (conditionsMatch) {
        const allowed = policy.effect === 'ALLOW';
        return {
          allowed,
          matchedPolicy: policy._id ? policy._id.toString() : 'DynamicPolicy',
          reason: `Matched policy with effect: ${policy.effect}`,
          evaluatedAt
        };
      }
    }

    // Default to allow if matching policies exist but none of the conditions triggered a decision
    return {
      allowed: true,
      matchedPolicy: 'DefaultFallthroughAllow',
      reason: 'No policy conditions matched the current attributes context.',
      evaluatedAt
    };
  }

  /**
   * Helper to invalidate organization policies cache namespace
   */
  async invalidateCache(orgId) {
    const cacheKey = `organization:${orgId}:policies`;
    try {
      await cacheService.del(cacheKey);
    } catch (err) {
      console.warn('[PolicyEngine] Cache invalidation failed:', err.message);
    }
  }
}

module.exports = new PolicyEngineService();
