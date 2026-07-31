const analyticsService = require("../services/analytics.service");
const workflowAnalyticsService = require("../services/analytics/workflowAnalytics.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getOverview = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";

  const [kpis, spend, vendors, departments, procurement, slaHealth, automation, overdue] = await Promise.all([
    analyticsService.getDashboardKPIs(req.organization._id, range),
    analyticsService.getSpendAnalytics(req.organization._id, range),
    analyticsService.getVendorAnalytics(req.organization._id, range),
    analyticsService.getDepartmentAnalytics(req.organization._id, range),
    analyticsService.getProcurementAnalytics(req.organization._id, range),
    workflowAnalyticsService.getSlaMetrics(req.organization._id, range),
    workflowAnalyticsService.getAutomationMetrics(req.organization._id, range),
    workflowAnalyticsService.getOverdueApprovals(req.organization._id)
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      kpis,
      spend,
      vendors,
      departments,
      procurement,
      slaHealth,
      automation,
      overdueCount: overdue.length
    }, "Analytics overview retrieved successfully")
  );
});

const getDashboardKPIs = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await analyticsService.getDashboardKPIs(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, "Dashboard KPIs retrieved successfully", data));
});

const getSpendAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "12m"; // default to 12 months for spend trend
  const data = await analyticsService.getSpendAnalytics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Spend analytics retrieved successfully"));
});

const getVendorAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "all";
  const data = await analyticsService.getVendorAnalytics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Vendor analytics retrieved successfully"));
});

const getDepartmentAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "all";
  const data = await analyticsService.getDepartmentAnalytics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Department analytics retrieved successfully"));
});

const getProcurementAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await analyticsService.getProcurementAnalytics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Procurement analytics retrieved successfully"));
});

// SLA & Workflow Intelligence
const getWorkflowSlaHealth = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await workflowAnalyticsService.getSlaMetrics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "SLA metrics retrieved successfully"));
});

const getWorkflowDepartmentScorecard = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await workflowAnalyticsService.getDepartmentScorecard(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Department scorecard retrieved successfully"));
});

const getWorkflowFunnel = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await workflowAnalyticsService.getApprovalFunnel(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Approval funnel retrieved successfully"));
});

const getAutomationMetrics = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await workflowAnalyticsService.getAutomationMetrics(req.organization._id, range);
  res.status(200).json(new ApiResponse(200, data, "Automation metrics retrieved successfully"));
});

const getOverdueApprovals = catchAsync(async (req, res) => {
  const data = await workflowAnalyticsService.getOverdueApprovals(req.organization._id);
  res.status(200).json(new ApiResponse(200, data, "Overdue approvals retrieved successfully"));
});

module.exports = {
  getOverview,
  getDashboardKPIs,
  getSpendAnalytics,
  getVendorAnalytics,
  getDepartmentAnalytics,
  getProcurementAnalytics,
  getWorkflowSlaHealth,
  getWorkflowDepartmentScorecard,
  getWorkflowFunnel,
  getAutomationMetrics,
  getOverdueApprovals
};
