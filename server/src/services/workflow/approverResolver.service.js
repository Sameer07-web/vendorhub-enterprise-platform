const User = require('../../models/User');
const Department = require('../../models/Department');
const ApprovalDelegation = require('../../models/ApprovalDelegation');

class ApproverResolverService {
  /**
   * Resolve pending approvers for a given workflow level.
   * Resolves roles like 'manager' via Department manager hierarchy,
   * or direct roles. Also handles active delegations.
   */
  async resolveApprovers(level, contextData) {
    let baseApprovers = [];

    // 1. Resolve based on rule approverRole
    if (level.approverRole === 'manager') {
      // Find the department manager
      if (contextData.departmentId) {
        const dept = await Department.findById(contextData.departmentId);
        if (dept && dept.managerId) {
          baseApprovers.push(dept.managerId);
        }
      }
    } else {
      // Find users with that specific role (e.g. 'Admin')
      const users = await User.find({ role: level.approverRole, isActive: true });
      baseApprovers = users.map(u => u._id);
    }

    if (baseApprovers.length === 0) {
      // Fallback: If no approver can be found, maybe auto-escalate or fallback to Admins
      const admins = await User.find({ role: 'Admin', isActive: true });
      baseApprovers = admins.map(u => u._id);
    }

    // 2. Handle Delegations
    const resolvedApprovers = new Set();
    const now = new Date();

    for (const approverId of baseApprovers) {
      if (level.canDelegate) {
        // Check for active delegations
        const delegation = await ApprovalDelegation.findOne({
          delegatorId: approverId,
          isActive: true,
          $or: [
            { isPermanent: true },
            { startDate: { $lte: now }, endDate: { $gte: now } }
          ]
        });

        if (delegation) {
          resolvedApprovers.add(delegation.delegateeId.toString());
        } else {
          resolvedApprovers.add(approverId.toString());
        }
      } else {
        resolvedApprovers.add(approverId.toString());
      }
    }

    return Array.from(resolvedApprovers);
  }
}

module.exports = new ApproverResolverService();
