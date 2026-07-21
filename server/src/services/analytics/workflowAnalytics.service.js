const ApprovalProcess = require('../../models/ApprovalProcess');
const AutomationExecution = require('../../models/AutomationExecution');
const PurchaseRequest = require('../../models/PurchaseRequest');

class WorkflowAnalyticsService {
  /**
   * Helper for date range matching
   */
  getDateMatch(field, range) {
    if (!range || range === 'all') return {};
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    if (range === '30d') now.setUTCDate(now.getUTCDate() - 30);
    else if (range === '90d') now.setUTCDate(now.getUTCDate() - 90);
    else if (range === '6m') now.setUTCMonth(now.getUTCMonth() - 6);
    else if (range === '12m') now.setUTCMonth(now.getUTCMonth() - 12);
    else now.setUTCDate(now.getUTCDate() - 30);
    return { [field]: { $gte: now } };
  }

  async getSlaMetrics(range = '30d') {
    const dateMatch = this.getDateMatch('createdAt', range);
    
    const stats = await ApprovalProcess.aggregate([
      { $match: { ...dateMatch } },
      { $unwind: "$history" },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          escalated: { $sum: { $cond: [{ $eq: ["$history.action", "ESCALATED"] }, 1, 0] } },
          breached: { $sum: { $cond: [{ $eq: ["$history.action", "SLA_BREACHED"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$history.action", "APPROVED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$history.action", "REJECTED"] }, 1, 0] } },
          autoApproved: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ["$history.action", "APPROVED"] }, 
                    // System actor check might be tricky in pure aggregation if we only have ObjectId.
                    // Assuming SYSTEM user is often the cause of "Auto-Approved based on automation rule"
                    { $regexMatch: { input: { $ifNull: ["$history.comments", ""] }, regex: /Auto-Approved/i } }
                  ]
                }, 1, 0
              ] 
            } 
          }
        }
      }
    ]);

    const result = stats[0] || { totalActions: 0, escalated: 0, breached: 0, approved: 0, rejected: 0, autoApproved: 0 };
    
    // SLA Adherence % = (Total Actions - Breached - Escalated) / Total Actions
    // Wait, better measure is breached events / total ApprovalProcesses?
    const totalProcesses = await ApprovalProcess.countDocuments({ ...dateMatch });
    
    // Total processes that have at least one SLA_BREACHED event
    const breachedProcesses = await ApprovalProcess.countDocuments({ ...dateMatch, 'history.action': 'SLA_BREACHED' });
    const escalatedProcesses = await ApprovalProcess.countDocuments({ ...dateMatch, 'history.action': 'ESCALATED' });

    const slaAdherence = totalProcesses > 0 ? ((totalProcesses - breachedProcesses) / totalProcesses) * 100 : 100;

    return {
      totalProcesses,
      breachedProcesses,
      escalatedProcesses,
      slaAdherence: slaAdherence.toFixed(1),
      actions: result
    };
  }

  async getDepartmentScorecard(range = '30d') {
    const dateMatch = this.getDateMatch('createdAt', range);

    // We join ApprovalProcess -> PurchaseRequest to get department
    const scorecard = await ApprovalProcess.aggregate([
      { $match: { entityType: 'PurchaseRequest', ...dateMatch } },
      { $lookup: { from: 'purchaserequests', localField: 'entityId', foreignField: '_id', as: 'pr' } },
      { $unwind: "$pr" },
      { $lookup: { from: 'departments', localField: 'pr.departmentId', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          departmentName: { $ifNull: ["$dept.name", "Unknown"] },
          status: 1,
          durationMs: {
            $cond: [
              { $and: [{ $ne: ["$completedAt", null] }, { $ne: ["$createdAt", null] }] },
              { $dateDiff: { startDate: "$createdAt", endDate: "$completedAt", unit: "millisecond" } },
              null
            ]
          },
          hasBreach: { $in: ["SLA_BREACHED", "$history.action"] },
          hasEscalation: { $in: ["ESCALATED", "$history.action"] }
        }
      },
      {
        $group: {
          _id: "$departmentName",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $in: ["$status", ["APPROVED", "REJECTED"]] }, 1, 0] } },
          avgDurationMs: { $avg: "$durationMs" },
          breaches: { $sum: { $cond: ["$hasBreach", 1, 0] } },
          escalations: { $sum: { $cond: ["$hasEscalation", 1, 0] } }
        }
      },
      {
        $project: {
          departmentName: "$_id",
          total: 1,
          completed: 1,
          avgDurationHours: { $divide: ["$avgDurationMs", 1000 * 60 * 60] },
          breaches: 1,
          escalations: 1,
          slaAdherence: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: [{ $subtract: ["$total", "$breaches"] }, "$total"] }, 100] },
              100
            ]
          }
        }
      },
      { $sort: { slaAdherence: -1 } }
    ]);

    return scorecard;
  }

  async getApprovalFunnel(range = '30d') {
    const dateMatch = this.getDateMatch('createdAt', range);
    
    const stats = await ApprovalProcess.aggregate([
      { $match: { ...dateMatch } },
      {
        $group: {
          _id: null,
          submitted: { $sum: 1 }, // All created
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || { submitted: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      submitted: result.submitted,
      pending: result.pending,
      completed: result.approved + result.rejected,
      approved: result.approved,
      rejected: result.rejected
    };
  }

  async getAutomationMetrics(range = '30d') {
    const dateMatch = this.getDateMatch('createdAt', range);

    const stats = await AutomationExecution.aggregate([
      { $match: { ...dateMatch } },
      {
        $group: {
          _id: "$status", // SUCCESS or FAILED
          count: { $sum: 1 },
          avgDurationMs: { $avg: "$durationMs" }
        }
      }
    ]);

    let success = 0;
    let failed = 0;
    let totalDuration = 0;
    
    stats.forEach(s => {
      if (s._id === 'SUCCESS') success = s.count;
      if (s._id === 'FAILED') failed = s.count;
      totalDuration += (s.avgDurationMs * s.count);
    });
    
    const total = success + failed;
    const avgExecutionMs = total > 0 ? (totalDuration / total) : 0;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 100;

    // Top rules
    const topRules = await AutomationExecution.aggregate([
      { $match: { ...dateMatch } },
      { $group: { _id: "$ruleId", executions: { $sum: 1 }, failures: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } } } },
      { $sort: { executions: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'automationrules', localField: '_id', foreignField: '_id', as: 'rule' } },
      { $unwind: "$rule" },
      { $project: { ruleName: "$rule.name", executions: 1, failures: 1 } }
    ]);

    return {
      totalExecutions: total,
      successCount: success,
      failureCount: failed,
      successRate,
      avgExecutionMs: avgExecutionMs.toFixed(2),
      topRules
    };
  }
  
  async getOverdueApprovals() {
    const overdue = await ApprovalProcess.find({
      status: 'PENDING',
      slaDeadline: { $lt: new Date() }
    })
    .populate('entityId')
    .populate('pendingApprovers', 'fullName email')
    .sort({ slaDeadline: 1 })
    .limit(50);
    
    return overdue;
  }
}

module.exports = new WorkflowAnalyticsService();
