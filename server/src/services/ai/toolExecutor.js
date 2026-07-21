const ApprovalProcess = require('../../models/ApprovalProcess');
const PurchaseRequest = require('../../models/PurchaseRequest');
const RFQ = require('../../models/RFQ');
const Vendor = require('../../models/Vendor');
const Notification = require('../../models/Notification');
const AIDraft = require('../../models/AIDraft');
const analyticsService = require('../analytics.service');

class ToolExecutor {
  /**
   * Executes a tool if the user is authorized.
   * @param {string} toolName 
   * @param {Object} args 
   * @param {Object} user 
   * @param {Object} rbacDef 
   * @returns {Object} JSON result of the tool
   */
  async execute(toolName, args, user, rbacDef) {
    // 1. RBAC Check
    if (!rbacDef.roles.includes(user.role)) {
      throw new Error(`Unauthorized: User role ${user.role} is not permitted to use tool ${toolName}`);
    }

    // 2. Dispatch
    switch (toolName) {
      case 'getPendingApprovals':
        return await this.getPendingApprovals(args, user);
      case 'getOverdueApprovals':
        return await this.getOverdueApprovals(args, user);
      case 'getPendingRFQs':
        return await this.getPendingRFQs(args, user);
      case 'getDashboardKPIs':
        return await this.getDashboardKPIs(args, user);
      case 'getPurchaseRequestSummary':
        return await this.getPurchaseRequestSummary(args, user);
      case 'getVendorSummary':
        return await this.getVendorSummary(args, user);
      case 'searchNotifications':
        return await this.searchNotifications(args, user);
      case 'draftPurchaseRequest':
        return await this.draftPurchaseRequest(args, user);
      case 'draftRFQ':
        return await this.draftRFQ(args, user);
      case 'explainApprovalPath':
        return await this.explainApprovalPath(args, user);
      case 'recommendAction':
        return await this.recommendAction(args, user);
      // Fallback
      default:
        throw new Error(`Tool ${toolName} is registered but not implemented in ToolExecutor.`);
    }
  }

  // --- Tool Implementations ---

  async getPendingApprovals(args, user) {
    const query = { status: 'PENDING' };
    if (user.role === 'Employee') {
      query.pendingApprovers = user._id;
    }
    const approvals = await ApprovalProcess.find(query)
      .populate('entityId', 'title requestNumber department')
      .lean()
      .limit(20);
    
    if (args.department) {
      return approvals.filter(a => a.entityId && a.entityId.department === args.department);
    }
    return approvals;
  }

  async getOverdueApprovals(args, user) {
    const approvals = await ApprovalProcess.find({ status: 'PENDING' })
      .populate('entityId', 'title requestNumber')
      .lean();
      
    const overdue = approvals.filter(a => {
      const hasBreach = a.history && a.history.some(h => h.action === 'SLA_BREACHED');
      return hasBreach;
    });
    return overdue.slice(0, 20);
  }

  async getPendingRFQs(args, user) {
    return await RFQ.find({ status: { $in: ['DRAFT', 'SENT', 'PARTIALLY_RESPONDED'] }, isDeleted: false })
      .select('rfqNumber title status quotationDeadline quotationCount')
      .lean()
      .limit(20);
  }

  async getDashboardKPIs(args, user) {
    const kpis = await analyticsService.getDashboardKPIs();
    return kpis;
  }

  async getPurchaseRequestSummary(args, user) {
    const prs = await PurchaseRequest.find({ status: 'PENDING_APPROVAL', isDeleted: false })
      .select('requestNumber title department estimatedCost priority')
      .lean()
      .limit(10);
    return prs;
  }

  async getVendorSummary(args, user) {
    const vendors = await Vendor.find({ status: 'ACTIVE', isDeleted: false })
      .select('name category rating complianceStatus')
      .lean()
      .limit(10);
    return vendors;
  }

  async searchNotifications(args, user) {
    return await Notification.find({ user: user._id, isRead: false })
      .select('title message type createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .limit(10);
  }

  // --- Phase 9.4 Workflow Tools ---

  async draftPurchaseRequest(args, user) {
    const draft = await AIDraft.create({
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

  async draftRFQ(args, user) {
    const draft = await AIDraft.create({
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

  async explainApprovalPath(args, user) {
    // Find the approval process for the given entityId
    // entityId might be a PR number like 'PR-1002' or an ObjectId. We check both.
    let pr = await PurchaseRequest.findOne({ requestNumber: args.entityId });
    if (!pr && args.entityId.length === 24) {
       pr = await PurchaseRequest.findById(args.entityId);
    }
    
    if (!pr) {
      return { error: `Could not find entity with ID: ${args.entityId}` };
    }

    const process = await ApprovalProcess.findOne({ entityId: pr._id })
      .populate('pendingApprovers', 'fullName email')
      .populate('history.actor', 'fullName')
      .lean();

    if (!process) {
      return { status: 'No active approval process found for this entity.' };
    }

    // Structure a clean summary for the LLM
    const summary = {
      entity: pr.requestNumber,
      title: pr.title,
      currentStatus: process.status,
      currentSequenceLevel: process.currentSequence,
      slaDeadline: process.slaDeadline,
      isOverdue: process.slaDeadline ? new Date() > new Date(process.slaDeadline) : false,
      pendingWith: process.pendingApprovers.map(a => a.fullName),
      recentHistory: process.history.slice(-3).map(h => ({
        action: h.action,
        actor: h.actor ? h.actor.fullName : 'System',
        date: h.createdAt,
        comments: h.comments
      }))
    };

    return summary;
  }

  async recommendAction(args, user) {
    // Dummy recommendation logic based on context
    const recommendations = [];
    
    // Always provide at least one generic recommendation based on standard playbook
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
