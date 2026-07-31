const ApprovalProcessRepository = require('../repositories/ApprovalProcessRepository');
const eventBus = require('../../services/automation/eventBus');
const SYSTEM_EVENTS = require('../../constants/events');

module.exports = async (job) => {
  const { organization, approvalProcessId, sequence, type } = job.data;
  const orgId = organization;

  if (!orgId) {
    return { skipped: true, reason: 'Organization ID is missing in job context' };
  }

  const process = await ApprovalProcessRepository.findOne(orgId, { _id: approvalProcessId }, null, {
    populate: [{ path: 'pendingApprovers' }]
  });
  
  if (!process) {
    return { skipped: true, reason: 'Process not found' };
  }

  // If the process has moved on or completed, this SLA timer is obsolete
  if (process.status !== 'PENDING' || process.currentSequence !== sequence) {
    return { skipped: true, reason: 'Sequence advanced or process no longer pending' };
  }

  // SLA event dispatch
  if (type === 'WARNING') {
    eventBus.emit(SYSTEM_EVENTS.SLA_WARNING, { organizationId: orgId, approvalProcessId: process._id });
  } else if (type === 'BREACH') {
    eventBus.emit(SYSTEM_EVENTS.SLA_BREACHED, { organizationId: orgId, approvalProcessId: process._id });
    
    // We also record the SLA breach in history for visibility
    process.history.push({
      sequence,
      action: 'SLA_BREACHED',
      comments: `SLA timer for sequence ${sequence} expired without action.`
    });
    
    await process.save();
  }

  return { success: true, eventEmitted: type };
};
