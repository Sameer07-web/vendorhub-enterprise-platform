const workflowService = require('../workflow/workflow.service');
const emailService = require('../email.service');
const notificationDispatcher = require('../notificationDispatcher');
const User = require('../../models/User');
const ApprovalProcess = require('../../models/ApprovalProcess');
const PurchaseRequest = require('../../models/PurchaseRequest');
const RFQ = require('../../models/RFQ');
const eventBus = require('./eventBus');
const SYSTEM_EVENTS = require('../../constants/events');

class ActionExecutor {
  async execute(action, contextData) {
    switch (action.type) {
      case 'AUTO_APPROVE':
        await this.handleAutoApprove(action.payload, contextData);
        break;
      case 'AUTO_REJECT':
        await this.handleAutoReject(action.payload, contextData);
        break;
      case 'ESCALATE':
        await this.handleEscalate(action.payload, contextData);
        break;
      case 'SEND_REMINDER':
        await this.handleSendReminder(action.payload, contextData);
        break;
      case 'SEND_NOTIFICATION':
        await this.handleSendNotification(action.payload, contextData);
        break;
      case 'SEND_EMAIL':
        await this.handleSendEmail(action.payload, contextData);
        break;
      case 'CREATE_RFQ':
        await this.handleCreateRfq(action.payload, contextData);
        break;
      default:
        console.warn(`[ActionExecutor] Unsupported action type: ${action.type}`);
    }
  }

  async getSystemUser() {
    return await User.findOne({ role: 'SYSTEM' });
  }

  async handleAutoApprove(payload, contextData) {
    if (!contextData.approvalProcessId) return;
    const systemUser = await this.getSystemUser();
    if (!systemUser) throw new Error('SYSTEM user not found');
    
    // We need to bypass the 'isApprover' check in workflow.service, 
    // or we can add SYSTEM user logic to workflow.service.
    // For now, let's call a specific method or modify processAction to allow SYSTEM.
    // I will use workflowService.processSystemAction to safely handle this.
    await workflowService.processSystemAction(
      contextData.approvalProcessId, 
      systemUser._id, 
      'APPROVED', 
      payload.comments || 'System Auto-Approved based on automation rule.'
    );
  }

  async handleAutoReject(payload, contextData) {
    if (!contextData.approvalProcessId) return;
    const systemUser = await this.getSystemUser();
    if (!systemUser) throw new Error('SYSTEM user not found');
    
    await workflowService.processSystemAction(
      contextData.approvalProcessId, 
      systemUser._id, 
      'REJECTED', 
      payload.comments || 'System Auto-Rejected based on automation rule.'
    );
  }

  async handleEscalate(payload, contextData) {
    if (!contextData.approvalProcessId) return;
    const process = await ApprovalProcess.findById(contextData.approvalProcessId);
    if (!process) return;

    // Escalate to next logic: for simplicity, we just push to an admin or predefined user in payload
    const escalateToId = payload.escalateToId;
    if (escalateToId) {
      process.pendingApprovers = [escalateToId];
      process.history.push({
        sequence: process.currentSequence,
        action: 'ESCALATED',
        comments: `Escalated to ${escalateToId} by Automation Engine.`
      });
      // Optionally reset SLA timer here
      await process.save();
    }
  }

  async handleSendReminder(payload, contextData) {
    if (!contextData.approvalProcessId) return;
    const process = await ApprovalProcess.findById(contextData.approvalProcessId).populate('pendingApprovers');
    if (!process || process.status !== 'PENDING') return;

    for (const approver of process.pendingApprovers) {
      await emailService.sendGenericEmail(
        approver,
        payload.subject || 'Reminder: Action Required',
        payload.message || `An approval requires your attention.`,
        `/app/workflows/${process._id}`
      );
      await notificationDispatcher.emitNotification(approver._id, {
        type: 'REMINDER',
        title: 'Approval Reminder',
        message: payload.message || `An approval is waiting for you.`
      });
    }
    
    process.history.push({
      sequence: process.currentSequence,
      action: 'REMINDER_SENT',
      comments: 'Automated reminder sent.'
    });
    await process.save();
  }

  async handleSendNotification(payload, contextData) {
    if (payload.userId) {
      await notificationDispatcher.emitNotification(payload.userId, {
        type: payload.type || 'SYSTEM_INFO',
        title: payload.title || 'Automation Notification',
        message: payload.message || 'An automated action occurred.'
      });
    }
  }

  async handleSendEmail(payload, contextData) {
    if (payload.email) {
      // Just mock send for now, or find User by email
      const user = await User.findOne({ email: payload.email });
      if (user) {
        await emailService.sendGenericEmail(
          user,
          payload.subject || 'Automation Email',
          payload.message || '',
          payload.link || '/'
        );
      }
    }
  }

  async handleCreateRfq(payload, contextData) {
    if (contextData.entityType !== 'PurchaseRequest' || !contextData.entityId) {
      console.warn('[ActionExecutor] CREATE_RFQ requires a PurchaseRequest context');
      return;
    }

    const pr = await PurchaseRequest.findById(contextData.entityId);
    if (!pr) return;

    // Check if an RFQ already exists for this PR to avoid duplicates
    const existing = await RFQ.findOne({ purchaseRequest: pr._id, isDeleted: false });
    if (existing) {
      console.log(`[ActionExecutor] RFQ already exists for PR ${pr.requestNumber}`);
      return;
    }

    const systemUser = await this.getSystemUser();
    
    // Generate a new RFQ number based on PR number or simple random string for now
    const rfqNumber = `RFQ-${pr.requestNumber}-${Math.floor(Math.random() * 10000)}`;
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 14); // default 2 weeks

    const newRfq = await RFQ.create({
      rfqNumber,
      purchaseRequest: pr._id,
      purchaseRequestSnapshot: {
        requestNumber: pr.requestNumber,
        title: pr.title,
        department: pr.department,
        priority: pr.priority
      },
      title: `RFQ for ${pr.title}`,
      description: payload.description || `Automated RFQ creation from PR ${pr.requestNumber}`,
      vendors: [pr.vendor], // start with the suggested vendor from PR
      status: 'DRAFT',
      quotationDeadline: defaultDeadline,
      createdBy: systemUser ? systemUser._id : pr.createdBy,
      statusHistory: [{
        status: 'DRAFT',
        changedBy: systemUser ? systemUser._id : pr.createdBy
      }]
    });

    console.log(`[ActionExecutor] Automatically created DRAFT RFQ: ${rfqNumber}`);

    // Emit event that an RFQ was created
    eventBus.emit(SYSTEM_EVENTS.RFQ_CREATED, {
      rfqId: newRfq._id,
      prId: pr._id
    });
  }
}

module.exports = new ActionExecutor();
