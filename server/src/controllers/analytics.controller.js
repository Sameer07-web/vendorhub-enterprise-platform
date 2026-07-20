const analyticsService = require("../services/analytics.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getOverview = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";

  const [kpis, spend, vendors, departments, procurement] = await Promise.all([
    analyticsService.getDashboardKPIs(range),
    analyticsService.getSpendAnalytics(range),
    analyticsService.getVendorAnalytics(range),
    analyticsService.getDepartmentAnalytics(range),
    analyticsService.getProcurementAnalytics(range)
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      kpis,
      spend,
      vendors,
      departments,
      procurement
    }, "Analytics overview retrieved successfully")
  );
});

const getDashboardKPIs = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await analyticsService.getDashboardKPIs(range);
  res.status(200).json(new ApiResponse(200, data, "Dashboard KPIs retrieved successfully"));
});

const getSpendAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "12m"; // default to 12 months for spend trend
  const data = await analyticsService.getSpendAnalytics(range);
  res.status(200).json(new ApiResponse(200, data, "Spend analytics retrieved successfully"));
});

const getVendorAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "all";
  const data = await analyticsService.getVendorAnalytics(range);
  res.status(200).json(new ApiResponse(200, data, "Vendor analytics retrieved successfully"));
});

const getDepartmentAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "all";
  const data = await analyticsService.getDepartmentAnalytics(range);
  res.status(200).json(new ApiResponse(200, data, "Department analytics retrieved successfully"));
});

const getProcurementAnalytics = catchAsync(async (req, res) => {
  const range = req.query.range || "30d";
  const data = await analyticsService.getProcurementAnalytics(range);
  res.status(200).json(new ApiResponse(200, data, "Procurement analytics retrieved successfully"));
});

module.exports = {
  getOverview,
  getDashboardKPIs,
  getSpendAnalytics,
  getVendorAnalytics,
  getDepartmentAnalytics,
  getProcurementAnalytics
};
