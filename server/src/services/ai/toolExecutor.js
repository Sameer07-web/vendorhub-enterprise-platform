const ApprovalProcessRepository = require('../../repositories/ApprovalProcessRepository');
const PurchaseRequestRepository = require('../../repositories/PurchaseRequestRepository');
const RFQRepository = require('../../repositories/RFQRepository');
const VendorRepository = require('../../repositories/VendorRepository');
const NotificationRepository = require('../../repositories/NotificationRepository');
const AIDraftRepository = require('../../repositories/AIDraftRepository');
const analyticsService = require('../analytics.service');

class ToolExecutor {
  /**
   * Executes a tool if the user is authorized.
   */
  async execute(toolName, args, user, rbacDef, sessionOrOrgId) {
    if (!rbacDef.roles.includes(user.role)) {
      throw new Error(`Unauthorized: User role ${user.role} is not permitted to use tool ${toolName}`);
    }

    const orgId = sessionOrOrgId
      ? sessionOrOrgId.organization
        ? sessionOrOrgId.organization
        : sessionOrOrgId._id
        ? sessionOrOrgId._id
        : sessionOrOrgId
      : user.organization;

    switch (toolName) {
      case 'getPendingApprovals':
        return await this.getPendingApprovals(orgId, args, user);
      case 'getOverdueApprovals':
        return await this.getOverdueApprovals(orgId, args, user);
      case 'getPendingRFQs':
        return await this.getPendingRFQs(orgId, args, user);
      case 'getDashboardKPIs':
        return await this.getDashboardKPIs(orgId, args, user);
      case 'getPurchaseRequestSummary':
        return await this.getPurchaseRequestSummary(orgId, args, user);
      case 'getVendorSummary':
        return await this.getVendorSummary(orgId, args, user);
      case 'searchNotifications':
        return await this.searchNotifications(orgId, args, user);
      case 'draftPurchaseRequest':
        return await this.draftPurchaseRequest(orgId, args, user);
      case 'draftRFQ':
        return await this.draftRFQ(orgId, args, user);
      case 'explainApprovalPath':
        return await this.explainApprovalPath(orgId, args, user);
      case 'recommendAction':
        return await this.recommendAction(orgId, args, user);
      default:
        throw new Error(`Tool ${toolName} is registered but not implemented in ToolExecutor.`);
    }
  }

  async getPendingApprovals(orgId, args, user) {
    const query = { status: 'PENDING' };
    if (user.role === 'Employee') {
      query.pendingApprovers = user._id;
    }
    const approvals = await ApprovalProcessRepository.findMany(orgId, query, null, {
      limit: 20,
      populate: [{ path: 'entityId', select: 'title requestNumber department' }]
    });
    
    if (args.department) {
      return approvals.filter(a => a.entityId && a.entityId.department === args.department);
    }
    return approvals;
  }

  async getOverdueApprovals(orgId, args, user) {
    const approvals = await ApprovalProcessRepository.findMany(orgId, { status: 'PENDING' }, null, {
      populate: [{ path: 'entityId', select: 'title requestNumber' }]
    });
      
    const overdue = approvals.filter(a => {
      return a.history && a.history.some(h => h.action === 'SLA_BREACHED');
    });
    return overdue.slice(0, 20);
  }

  async getPendingRFQs(orgId, args, user) {
    return await RFQRepository.findMany(orgId, { status: { $in: ['DRAFT', 'SENT', 'PARTIALLY_RESPONDED'] }, isDeleted: false }, 'rfqNumber title status quotationDeadline quotationCount', { limit: 20 });
  }

  async getDashboardKPIs(orgId, args, user) {
    return await analyticsService.getDashboardKPIs(orgId);
  }

  async getPurchaseRequestSummary(orgId, args, user) {
    return await PurchaseRequestRepository.findMany(orgId, { status: 'PENDING_APPROVAL', isDeleted: false }, 'requestNumber title department estimatedCost priority', { limit: 10 });
  }

  async getVendorSummary(orgId, args, user) {
    return await VendorRepository.findMany(orgId, { status: 'Active', isDeleted: false }, 'companyName vendorCode category rating complianceStatus', { limit: 10 });
  }

  async searchNotifications(orgId, args, user) {
    return await NotificationRepository.findMany(orgId, { recipient: user._id, isRead: false }, 'title message type createdAt', { sort: { createdAt: -1 }, limit: 10 });
  }

  async draftPurchaseRequest(orgId, args, user) {
    const draft = await AIDraftRepository.create(orgId, {
      user: user._id,
      entityType: 'PurchaseRequest',
      draftJson: {
        title: args.title,
        department: args.department,
        items: args.items
      }
    });

    return {
      success: true,
      draftId: draft._id,
      url: `/app/purchase-requests/new?draft=${draft._id}`,
      message: 'Draft created successfully. Navigate to the provided URL to complete the workflow.'
    };
  }

  async draftRFQ(orgId, args, user) {
    const draft = await AIDraftRepository.create(orgId, {
      user: user._id,
      entityType: 'RFQ',
      draftJson: {
        title: args.title,
        description: args.description,
        items: args.items
      }
    });

    return {
      success: true,
      draftId: draft._id,
      url: `/app/rfqs/new?draft=${draft._id}`,
      message: 'Draft created successfully. Navigate to the provided URL to complete the workflow.'
    };
  }

  async explainApprovalPath(orgId, args, user) {
    let pr = await PurchaseRequestRepository.findOne(orgId, { requestNumber: args.entityId });
    if (!pr && args.entityId && args.entityId.length === 24) {
      pr = await PurchaseRequestRepository.findById(orgId, args.entityId);
    }
    
    if (!pr) {
      return { error: `Could not find entity with ID: ${args.entityId}` };
    }

    const process = await ApprovalProcessRepository.findOne(orgId, { entityId: pr._id }, null, {
      populate: [
        { path: 'pendingApprovers', select: 'fullName email' },
        { path: 'history.actorId', select: 'fullName' }
      ]
    });

    if (!process) {
      return { status: 'No active approval process found for this entity.' };
    }

    return {
      entity: pr.requestNumber,
      title: pr.title,
      currentStatus: process.status,
      currentSequenceLevel: process.currentSequence,
      slaDeadline: process.slaDeadline,
      isOverdue: process.slaDeadline ? new Date() > new Date(process.slaDeadline) : false,
      pendingWith: (process.pendingApprovers || []).map(a => a.fullName || a.email),
      recentHistory: (process.history || []).slice(-3).map(h => ({
        action: h.action,
        actor: h.actorId ? h.actorId.fullName : 'System',
        date: h.actionDate || h.createdAt,
        comments: h.comments
      }))
    };
  }

  async recommendAction(orgId, args, user) {
    const recommendations = [];
    if (args.context && args.context.toLowerCase().includes('overdue')) {
      recommendations.push({
        action: 'SEND_REMINDER',
        confidence: 95,
        reason: 'Approval is overdue. A friendly reminder is the standard first step.',
        endpoint: `/api/v1/workflows/remind/${args.entityId}`
      });
      recommendations.push({
        action: 'ESCALATE',
        confidence: 60,
        reason: 'If the reminder was already sent, escalation is recommended.',
        endpoint: `/api/v1/workflows/escalate/${args.entityId}`
      });
    } else {
      recommendations.push({
        action: 'REVIEW_DETAILS',
        confidence: 100,
        reason: 'Review the full details before taking action.',
        endpoint: `/app/purchase-requests/${args.entityId}`
      });
    }

    return { recommendations };
  }
}

module.exports = new ToolExecutor();
