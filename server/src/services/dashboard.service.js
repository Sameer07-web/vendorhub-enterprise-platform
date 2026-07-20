const Vendor = require("../models/Vendor");
const PurchaseRequest = require("../models/PurchaseRequest");
const RFQ = require("../models/RFQ");
const Quotation = require("../models/Quotation");
const Notification = require("../models/Notification");

/**
 * Get all dashboard statistics from live MongoDB data
 */
const getDashboardStats = async (userId) => {
  // KPI counts
  const [vendorCount, prCounts, activeRfqCount, quotationCount] = await Promise.all([
    Vendor.countDocuments({ isDeleted: false }),
    PurchaseRequest.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    RFQ.countDocuments({ isDeleted: false, status: { $in: ["DRAFT", "SENT", "PARTIALLY_RESPONDED"] } }),
    Quotation.countDocuments({ isDeleted: false }),
  ]);

  // Parse PR status counts
  const prStatusMap = {};
  let totalPRs = 0;
  prCounts.forEach((item) => {
    prStatusMap[item._id] = item.count;
    totalPRs += item.count;
  });

  // Total spend (sum of estimatedCost from approved PRs)
  const spendResult = await PurchaseRequest.aggregate([
    { $match: { isDeleted: false, status: "APPROVED" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: null,
        totalSpend: {
          $sum: { $multiply: ["$items.quantity", "$items.estimatedUnitCost"] },
        },
      },
    },
  ]);

  const totalSpend = spendResult.length > 0 ? spendResult[0].totalSpend : 0;

  // Vendor distribution by category
  const vendorDistribution = await Vendor.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$vendorCategory", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const categoryColors = {
    Software: "#3B82F6",
    Hardware: "#8B5CF6",
    Services: "#10B981",
    "Office Supplies": "#F59E0B",
    Consulting: "#EF4444",
    Other: "#6B7280",
  };

  const vendorDistributionData = vendorDistribution.map((item) => ({
    name: item._id || "Uncategorized",
    value: item.count,
    color: categoryColors[item._id] || "#6B7280",
  }));

  // Spend analytics (monthly for last 7 months)
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
  sevenMonthsAgo.setDate(1);
  sevenMonthsAgo.setHours(0, 0, 0, 0);

  const monthlySpend = await PurchaseRequest.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "APPROVED",
        createdAt: { $gte: sevenMonthsAgo },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        spend: {
          $sum: { $multiply: ["$items.quantity", "$items.estimatedUnitCost"] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendAnalyticsData = monthlySpend.map((item) => ({
    name: monthNames[item._id.month - 1],
    spend: item.spend,
  }));

  // If no monthly data, return empty-safe default
  if (spendAnalyticsData.length === 0) {
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      spendAnalyticsData.push({ name: monthNames[d.getMonth()], spend: 0 });
    }
  }

  // Pending approvals (for Manager/Admin dashboard)
  const pendingApprovals = await PurchaseRequest.find({
    isDeleted: false,
    status: "PENDING_APPROVAL",
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("createdBy", "fullName department")
    .lean();

  const pendingApprovalsData = pendingApprovals.map((pr) => ({
    id: pr.prId,
    _id: pr._id,
    title: pr.title,
    requester: pr.createdBy?.fullName || "Unknown",
    department: pr.department,
    amount: pr.items
      ? pr.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.estimatedUnitCost || 0), 0)
      : 0,
    urgency: pr.priority === "CRITICAL" ? "Critical" : pr.priority === "HIGH" ? "High" : "Normal",
    date: pr.createdAt,
  }));

  // Recent activity (now powered by Notifications)
  const recentNotifications = await Notification.find({ recipient: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const activityTimelineData = recentNotifications.map(notif => {
    let type = "system";
    if (["PR_APPROVED", "RFQ_AWARDED"].includes(notif.type)) type = "success";
    if (["PR_REJECTED"].includes(notif.type)) type = "warning";
    if (["PR_SUBMITTED", "RFQ_INVITED"].includes(notif.type)) type = "request";

    return {
      id: notif._id,
      type,
      title: notif.title,
      description: notif.message,
      time: notif.createdAt,
    };
  });

  // Recent purchase requests table (top 5)
  const recentPurchaseRequests = await PurchaseRequest.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("createdBy", "fullName")
    .lean();

  const recentPRsData = recentPurchaseRequests.map((pr) => ({
    id: pr.prId,
    _id: pr._id,
    title: pr.title,
    department: pr.department,
    vendor: pr.createdBy?.fullName || "—",
    amount: pr.items
      ? pr.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.estimatedUnitCost || 0), 0)
      : 0,
    status: pr.status,
    date: pr.createdAt,
  }));

  return {
    kpiData: {
      vendors: { total: vendorCount },
      purchaseRequests: {
        total: totalPRs,
        pending: prStatusMap["PENDING_APPROVAL"] || 0,
      },
      activeRfqs: { total: activeRfqCount },
      totalSpend: { total: totalSpend },
      quotations: { total: quotationCount },
    },
    spendAnalyticsData,
    vendorDistributionData,
    recentPurchaseRequests: recentPRsData,
    pendingApprovals: pendingApprovalsData,
    activityTimelineData,
  };
};

module.exports = { getDashboardStats };
