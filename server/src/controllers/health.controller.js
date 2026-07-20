const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Health telemetry endpoint handler
 */
const getHealth = catchAsync(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  
  const healthData = {
    status: "UP",
    database: dbStatus,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };

  res.status(200).json(new ApiResponse(200, "System status is healthy", healthData));
});

module.exports = {
  getHealth
};
