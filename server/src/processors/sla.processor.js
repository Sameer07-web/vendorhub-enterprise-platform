const ApprovalProcess = require('../../models/ApprovalProcess');
const eventBus = require('../../services/automation/eventBus');
const SYSTEM_EVENTS = require('../../constants/events');

module.exports = async (job) => {
  const { approvalProcessId, sequence, type } = job.data;

  const process = await ApprovalProcess.findById(approvalProcessId).populate('pendingApprovers');
  
  if (!process) {
    return { skipped: true, reason: 'Process not found' };
  }

  // If the process has moved on or completed, this SLA timer is obsolete
  if (process.status !== 'PENDING' || process.currentSequence !== sequence) {
    return { skipped: true, reason: 'Sequence advanced or process no longer pending' };
  }

  // SLA event dispatch
  if (type === 'WARNING') {
    eventBus.emit(SYSTEM_EVENTS.SLA_WARNING, { approvalProcessId: process._id });
  } else if (type === 'BREACH') {
    eventBus.emit(SYSTEM_EVENTS.SLA_BREACHED, { approvalProcessId: process._id });
    
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
