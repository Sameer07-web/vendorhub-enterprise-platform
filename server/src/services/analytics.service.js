const Vendor = require("../models/Vendor");
const PurchaseRequest = require("../models/PurchaseRequest");
const RFQ = require("../models/RFQ");
const Quotation = require("../models/Quotation");
const cache = require("../utils/cache");

/**
 * Parses the range query parameter into a MongoDB date filter object.
 * @param {string} range e.g., '30d', '90d', '6m', '12m', 'all'
 * @returns {Date|null} the start date, or null if 'all'
 */
const getStartDateFromRange = (range) => {
  if (!range || range === "all") return null;
  const now = new Date();
  
  // Set to midnight UTC for consistent reporting
  now.setUTCHours(0, 0, 0, 0);

  if (range === "30d") {
    now.setUTCDate(now.getUTCDate() - 30);
  } else if (range === "90d") {
    now.setUTCDate(now.getUTCDate() - 90);
  } else if (range === "6m") {
    now.setUTCMonth(now.getUTCMonth() - 6);
  } else if (range === "12m") {
    now.setUTCMonth(now.getUTCMonth() - 12);
  } else {
    // Default fallback to 30d if invalid range
    now.setUTCDate(now.getUTCDate() - 30);
  }
  return now;
};

/**
 * Builds the $match stage for the start date based on the provided field name.
 */
const getDateMatch = (field, startDate) => {
  return startDate ? { [field]: { $gte: startDate } } : {};
};

/**
 * Formats a metric into a standard DTO.
 */
const formatMetric = (title, value, change = 0, trend = "neutral") => ({
  title,
  value,
  change,
  trend
});

class AnalyticsService {
  
  async getDashboardKPIs(range = "30d") {
    const cacheKey = `kpis_${range}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = getStartDateFromRange(range);
    
    // 1. Total and Active Vendors
    const vendorMatch = getDateMatch("createdAt", startDate);
    const vendorStats = await Vendor.aggregate([
      { $match: { isDeleted: false, ...vendorMatch } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } }
        }
      }
    ]);

    // 2. PR Stats
    const prMatch = getDateMatch("createdAt", startDate);
    const prStats = await PurchaseRequest.aggregate([
      { $match: { isDeleted: false, ...prMatch } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
          // Average approval time (in milliseconds)
          avgApprovalTimeMs: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ["$approvedAt", null] }, { $ne: ["$submittedAt", null] }] },
                { $dateDiff: { startDate: "$submittedAt", endDate: "$approvedAt", unit: "millisecond" } },
                null
              ]
            }
          }
        }
      }
    ]);

    // 3. RFQ Stats
    const rfqMatch = getDateMatch("createdAt", startDate);
    const rfqStats = await RFQ.aggregate([
      { $match: { isDeleted: false, ...rfqMatch } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $in: ["$status", ["SENT", "PARTIALLY_RESPONDED"]] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } },
          // Average RFQ lifecycle (in milliseconds)
          avgLifecycleMs: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ["$closedAt", null] }, { $ne: ["$sentAt", null] }] },
                { $dateDiff: { startDate: "$sentAt", endDate: "$closedAt", unit: "millisecond" } },
                null
              ]
            }
          }
        }
      }
    ]);

    // 4. Quotation & Spend Stats
    const quoteMatch = getDateMatch("createdAt", startDate);
    const quoteStats = await Quotation.aggregate([
      { $match: { isDeleted: false, ...quoteMatch } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          awarded: { $sum: { $cond: [{ $eq: ["$isWinner", true] }, 1, 0] } },
          totalSpend: { $sum: { $cond: [{ $eq: ["$isWinner", true] }, "$totalAmount", 0] } }
        }
      }
    ]);

    const vStats = vendorStats[0] || { total: 0, active: 0 };
    const pStats = prStats[0] || { total: 0, pending: 0, approved: 0, rejected: 0, avgApprovalTimeMs: 0 };
    const rStats = rfqStats[0] || { total: 0, active: 0, closed: 0, avgLifecycleMs: 0 };
    const qStats = quoteStats[0] || { total: 0, awarded: 0, totalSpend: 0 };

    // Format average times to readable strings or raw values. 
    // Here we return hours for ease of consumption by frontend.
    const avgApprovalHours = pStats.avgApprovalTimeMs ? (pStats.avgApprovalTimeMs / (1000 * 60 * 60)).toFixed(1) : 0;
    const avgRfqHours = rStats.avgLifecycleMs ? (rStats.avgLifecycleMs / (1000 * 60 * 60)).toFixed(1) : 0;

    const result = {
      totalSpend: formatMetric("Total Spend", qStats.totalSpend),
      vendors: formatMetric("Total Vendors", vStats.total),
      activeVendors: formatMetric("Active Vendors", vStats.active),
      purchaseRequests: formatMetric("Purchase Requests", pStats.total),
      pendingApprovals: formatMetric("Pending Approvals", pStats.pending),
      rfqs: formatMetric("Total RFQs", rStats.total),
      quotations: formatMetric("Total Quotations", qStats.total),
      awardedQuotations: formatMetric("Awarded Quotations", qStats.awarded),
      avgApprovalTimeHours: formatMetric("Avg Approval Time (Hrs)", Number(avgApprovalHours)),
      avgRfqLifecycleHours: formatMetric("Avg RFQ Time (Hrs)", Number(avgRfqHours))
    };

    await cache.set(cacheKey, result);
    return result;
  }

  async getSpendAnalytics(range = "12m") {
    const cacheKey = `spend_${range}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = getStartDateFromRange(range);
    const dateMatch = getDateMatch("quotationDate", startDate);

    // Group by Month/Year in UTC
    const spendOverTime = await Quotation.aggregate([
      { $match: { isDeleted: false, isWinner: true, ...dateMatch } },
      {
        $group: {
          _id: {
            year: { $year: { date: "$quotationDate", timezone: "UTC" } },
            month: { $month: { date: "$quotationDate", timezone: "UTC" } }
          },
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          amount: 1,
          count: 1
        }
      }
    ]);

    await cache.set(cacheKey, spendOverTime);
    return spendOverTime;
  }

  async getVendorAnalytics(range = "all") {
    const cacheKey = `vendor_analytics_${range}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = getStartDateFromRange(range);
    const dateMatch = getDateMatch("quotationDate", startDate);

    const topVendorsBySpend = await Quotation.aggregate([
      { $match: { isDeleted: false, isWinner: true, ...dateMatch } },
      {
        $group: {
          _id: "$vendor",
          totalSpend: { $sum: "$totalAmount" },
          awardedCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      { $unwind: "$vendorDetails" },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          vendorName: "$vendorDetails.companyName",
          category: "$vendorDetails.vendorCategory",
          totalSpend: 1,
          awardedCount: 1
        }
      }
    ]);

    await cache.set(cacheKey, topVendorsBySpend);
    return topVendorsBySpend;
  }

  async getDepartmentAnalytics(range = "all") {
    const cacheKey = `department_analytics_${range}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = getStartDateFromRange(range);
    const dateMatch = getDateMatch("quotationDate", startDate);

    // Calculate spend per department.
    // Quotation (isWinner: true) -> RFQ -> PurchaseRequest (department)
    const deptSpend = await Quotation.aggregate([
      { $match: { isDeleted: false, isWinner: true, ...dateMatch } },
      {
        $lookup: {
          from: "rfqs",
          localField: "rfq",
          foreignField: "_id",
          as: "rfqData"
        }
      },
      { $unwind: "$rfqData" },
      {
        $lookup: {
          from: "purchaserequests",
          localField: "rfqData.purchaseRequest",
          foreignField: "_id",
          as: "prData"
        }
      },
      { $unwind: "$prData" },
      {
        $group: {
          _id: "$prData.department",
          totalSpend: { $sum: "$totalAmount" },
          awardedCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpend: -1 } },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalSpend: 1,
          awardedCount: 1
        }
      }
    ]);

    await cache.set(cacheKey, deptSpend);
    return deptSpend;
  }

  async getProcurementAnalytics(range = "30d") {
    const cacheKey = `proc_analytics_${range}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = getStartDateFromRange(range);
    const rfqMatch = getDateMatch("createdAt", startDate);

    const rfqStats = await RFQ.aggregate([
      { $match: { isDeleted: false, ...rfqMatch } },
      {
        $group: {
          _id: null,
          avgLifecycleMs: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ["$closedAt", null] }, { $ne: ["$sentAt", null] }] },
                { $dateDiff: { startDate: "$sentAt", endDate: "$closedAt", unit: "millisecond" } },
                null
              ]
            }
          },
          pendingWorkload: {
            $sum: { $cond: [{ $in: ["$status", ["SENT", "PARTIALLY_RESPONDED"]] }, 1, 0] }
          },
          completedProcurement: {
            $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = rfqStats[0] || { avgLifecycleMs: 0, pendingWorkload: 0, completedProcurement: 0 };
    const avgLifecycleDays = stats.avgLifecycleMs ? (stats.avgLifecycleMs / (1000 * 60 * 60 * 24)).toFixed(1) : 0;

    const result = {
      avgRfqLifecycleDays: formatMetric("Avg RFQ Lifecycle (Days)", Number(avgLifecycleDays)),
      pendingWorkload: formatMetric("Pending RFQs", stats.pendingWorkload),
      completedProcurement: formatMetric("Completed RFQs", stats.completedProcurement)
    };

    await cache.set(cacheKey, result);
    return result;
  }

}

module.exports = new AnalyticsService();
