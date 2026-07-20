const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const dashboardService = require("../services/dashboard.service");

const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user._id);

  res.status(200).json(
    new ApiResponse(200, "Dashboard statistics retrieved successfully", stats)
  );
});

module.exports = { getDashboardStats };
