const ApprovalProcess = require('../../models/ApprovalProcess');
const WorkflowRule = require('../../models/WorkflowRule');
const ruleEngine = require('./ruleEngine.service');
const approverResolver = require('./approverResolver.service');
const workflowQueue = require('../../queues/workflow.queue');
const emailService = require('../email.service');
const notificationDispatcher = require('../notificationDispatcher');
const eventBus = require('../automation/eventBus');
const SYSTEM_EVENTS = require('../../constants/events');

class WorkflowService {
  /**
   * Kick off a new workflow for an entity.
   */
  async triggerWorkflow(entityId, entityType, contextData) {
    const rule = await ruleEngine.findMatchingRule(entityType, contextData);
    
    if (!rule) {
      // Auto-approve if no rules match? Or require admin?
      // For now, let's just return a standard "No rule found"
      throw new Error(`No workflow rule found for ${entityType}`);
    }

    // Sort levels by sequence
    const levels = [...rule.levels].sort((a, b) => a.sequence - b.sequence);
    if (levels.length === 0) {
      throw new Error('Workflow rule has no approval levels defined');
    }

    const firstLevel = levels[0];
    const pendingApprovers = await approverResolver.resolveApprovers(firstLevel, contextData);

    const slaDeadline = new Date(Date.now() + firstLevel.slaHours * 60 * 60 * 1000);

    const process = await ApprovalProcess.create({
      entityId,
      entityType,
      workflowRuleId: rule._id,
      status: 'PENDING',
      currentSequence: firstLevel.sequence,
      pendingApprovers,
      slaDeadline,
      history: [{
        sequence: firstLevel.sequence,
        action: 'SUBMITTED',
        actorId: contextData.requesterId,
        comments: 'Workflow initiated.'
      }]
    });

    // Enqueue SLA Timers (50% Warning, 100% Breach)
    await this.scheduleSlaTimer(process._id, firstLevel.sequence, firstLevel.slaHours);
    
    // Notify Approvers
    await this.notifyApprovers(pendingApprovers, entityType, entityId);

    // Emit event for Automation Engine
    eventBus.emit(SYSTEM_EVENTS.WORKFLOW_STARTED, {
      approvalProcessId: process._id,
      entityId,
      entityType,
      departmentId: contextData.departmentId,
      amount: contextData.amount
    });

    return process;
  }

  async scheduleSlaTimer(approvalProcessId, sequence, slaHours) {
    // 50% warning
    const warningDelay = (slaHours / 2) * 60 * 60 * 1000;
    await workflowQueue.add('sla-timer', {
      approvalProcessId,
      sequence,
      type: 'WARNING'
    }, {
      delay: warningDelay,
      jobId: `sla-warn-${approvalProcessId}-${sequence}`
    });

    // 100% breach
    const breachDelay = slaHours * 60 * 60 * 1000;
    await workflowQueue.add('sla-timer', {
      approvalProcessId,
      sequence,
      type: 'BREACH'
    }, {
      delay: breachDelay,
      jobId: `sla-breach-${approvalProcessId}-${sequence}`
    });
  }

  async notifyApprovers(approvers, entityType, entityId) {
    // We expect an array of User ObjectIds. We need their emails.
    const User = require('../../models/User');
    const users = await User.find({ _id: { $in: approvers } });
    
    for (const u of users) {
      await emailService.sendGenericEmail(
        u,
        'Action Required: Approval Pending',
        `A new ${entityType} requires your review and approval.`,
        `/app/workflows` // Generic link
      );
      
      await notificationDispatcher.emitNotification(u._id, {
        type: 'APPROVAL_REQUIRED',
        title: 'Pending Approval',
        message: `You have a new ${entityType} awaiting your review.`
      });
    }
  }

  /**
   * Process an action on a workflow
   */
  async processAction(processId, userId, action, comments) {
    const process = await ApprovalProcess.findById(processId).populate('workflowRuleId');
    if (!process) throw new Error('Approval process not found');
    if (process.status !== 'PENDING') throw new Error('Process is not pending');
    
    const isApprover = process.pendingApprovers.some(id => id.toString() === userId.toString());
    if (!isApprover) throw new Error('User is not authorized to approve this step');

    const rule = process.workflowRuleId;
    const currentLevelObj = rule.levels.find(l => l.sequence === process.currentSequence);

    if (currentLevelObj.requireComments && !comments) {
      throw new Error('Comments are required for this action');
    }

    if (action === 'REJECTED') {
      process.status = 'REJECTED';
      process.completedAt = new Date();
      process.history.push({
        sequence: process.currentSequence,
        action: 'REJECTED',
        actorId: userId,
        comments
      });
      await process.save();
      
      // Notify requester
      if (currentLevelObj.notifyRequester) {
        // Find requester from SUBMITTED history
        const submitEvent = process.history.find(h => h.action === 'SUBMITTED');
        if (submitEvent && submitEvent.actorId) {
           await notificationDispatcher.emitNotification(submitEvent.actorId, {
             type: 'WORKFLOW_REJECTED',
             title: 'Request Rejected',
             message: `Your request was rejected: ${comments || 'No comments'}`
           });
        }
      }
      return process;
    }

    if (action === 'APPROVED') {
      process.history.push({
        sequence: process.currentSequence,
        action: 'APPROVED',
        actorId: userId,
        comments
      });

      // Emit Approved event for this stage
      eventBus.emit(SYSTEM_EVENTS.WORKFLOW_STAGE_APPROVED, {
        approvalProcessId: process._id,
        sequence: process.currentSequence
      });

      // Find next level
      const sortedLevels = [...rule.levels].sort((a, b) => a.sequence - b.sequence);
      const currentIndex = sortedLevels.findIndex(l => l.sequence === process.currentSequence);
      const nextLevel = sortedLevels[currentIndex + 1];

      if (nextLevel) {
        // Advance to next level
        process.currentSequence = nextLevel.sequence;
        process.currentStageStartedAt = new Date();
        process.slaDeadline = new Date(Date.now() + nextLevel.slaHours * 60 * 60 * 1000);
        
        // We'd need contextData. We can pull it from the entity or pass it.
        // For now, let's fetch basic context data (e.g. department of PR)
        let deptId = null;
        if (process.entityType === 'PurchaseRequest') {
          const PurchaseRequest = require('../../models/PurchaseRequest');
          const pr = await PurchaseRequest.findById(process.entityId);
          // Assuming PR now has departmentId as we refactored
          deptId = pr?.departmentId;
        }

        const nextApprovers = await approverResolver.resolveApprovers(nextLevel, { departmentId: deptId });
        process.pendingApprovers = nextApprovers;
        
        await this.scheduleSlaTimer(process._id, nextLevel.sequence, nextLevel.slaHours);
        await this.notifyApprovers(nextApprovers, process.entityType, process.entityId);
      } else {
        // Finished
        process.status = 'APPROVED';
        process.completedAt = new Date();
        
        eventBus.emit(SYSTEM_EVENTS.WORKFLOW_APPROVED, {
          approvalProcessId: process._id,
          entityId: process.entityId,
          entityType: process.entityType
        });
      }

      await process.save();
      return process;
    }

    throw new Error('Invalid action');
  }

  /**
   * Process a system-triggered action (bypass regular isApprover checks)
   */
  async processSystemAction(processId, systemUserId, action, comments) {
    const process = await ApprovalProcess.findById(processId).populate('workflowRuleId');
    if (!process) throw new Error('Approval process not found');
    if (process.status !== 'PENDING') throw new Error('Process is not pending');

    const rule = process.workflowRuleId;
    
    if (action === 'REJECTED') {
      process.status = 'REJECTED';
      process.completedAt = new Date();
      process.history.push({
        sequence: process.currentSequence,
        action: 'REJECTED', // could use SYSTEM_AUTO_REJECTED if added to enum
        actorId: systemUserId,
        comments
      });
      await process.save();
      
      eventBus.emit(SYSTEM_EVENTS.WORKFLOW_REJECTED, {
        approvalProcessId: process._id,
        entityId: process.entityId,
        entityType: process.entityType
      });

      return process;
    }

    if (action === 'APPROVED') {
      process.history.push({
        sequence: process.currentSequence,
        action: 'APPROVED', 
        actorId: systemUserId,
        comments
      });

      // Find next level logic identical to manual approval
      const sortedLevels = [...rule.levels].sort((a, b) => a.sequence - b.sequence);
      const currentIndex = sortedLevels.findIndex(l => l.sequence === process.currentSequence);
      const nextLevel = sortedLevels[currentIndex + 1];

      if (nextLevel) {
        process.currentSequence = nextLevel.sequence;
        process.currentStageStartedAt = new Date();
        process.slaDeadline = new Date(Date.now() + nextLevel.slaHours * 60 * 60 * 1000);
        
        let deptId = null;
        if (process.entityType === 'PurchaseRequest') {
          const PurchaseRequest = require('../../models/PurchaseRequest');
          const pr = await PurchaseRequest.findById(process.entityId);
          deptId = pr?.departmentId;
        }

        const nextApprovers = await approverResolver.resolveApprovers(nextLevel, { departmentId: deptId });
        process.pendingApprovers = nextApprovers;
        
        await this.scheduleSlaTimer(process._id, nextLevel.sequence, nextLevel.slaHours);
        await this.notifyApprovers(nextApprovers, process.entityType, process.entityId);
      } else {
        process.status = 'APPROVED';
        process.completedAt = new Date();
        
        eventBus.emit(SYSTEM_EVENTS.WORKFLOW_APPROVED, {
          approvalProcessId: process._id,
          entityId: process.entityId,
          entityType: process.entityType
        });
      }

      await process.save();
      return process;
    }

    throw new Error('Invalid system action');
  }
}

module.exports = new WorkflowService();
