const rfqService = require("../services/rfq.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const createRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.createRFQ(req.body, req.user);
  res.status(201).json(new ApiResponse(201, "RFQ created successfully", rfq));
});

const getRFQs = catchAsync(async (req, res) => {
  const result = await rfqService.getRFQs(req.query);
  res.status(200).json(new ApiResponse(200, "RFQs fetched successfully", result));
});

const getRFQById = catchAsync(async (req, res) => {
  const rfq = await rfqService.getRFQById(req.params.id);
  res.status(200).json(new ApiResponse(200, "RFQ details fetched successfully", rfq));
});

const updateRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.updateRFQ(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, "RFQ updated successfully", rfq));
});

const sendRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.sendRFQ(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "RFQ sent successfully", rfq));
});

const closeRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.closeRFQ(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "RFQ closed successfully", rfq));
});

const cancelRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.cancelRFQ(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "RFQ cancelled successfully", rfq));
});

const deleteRFQ = catchAsync(async (req, res) => {
  await rfqService.deleteRFQ(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "RFQ deleted successfully"));
});

module.exports = {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  sendRFQ,
  closeRFQ,
  cancelRFQ,
  deleteRFQ
};
