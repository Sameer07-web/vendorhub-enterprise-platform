const prService = require("../services/purchaseRequest.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const createPurchaseRequest = catchAsync(async (req, res) => {
  const pr = await prService.createPurchaseRequest(req.body, req.user);
  res.status(201).json(new ApiResponse(201, "Purchase Request created successfully", pr));
});

const getPurchaseRequests = catchAsync(async (req, res) => {
  const result = await prService.getPurchaseRequests(req.query, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Requests fetched successfully", result));
});

const getPurchaseRequestById = catchAsync(async (req, res) => {
  const pr = await prService.getPurchaseRequestById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request details fetched successfully", pr));
});

const updatePurchaseRequest = catchAsync(async (req, res) => {
  const pr = await prService.updatePurchaseRequest(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request updated successfully", pr));
});

const submitPurchaseRequest = catchAsync(async (req, res) => {
  const pr = await prService.submitPurchaseRequest(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request submitted successfully", pr));
});

const approvePurchaseRequest = catchAsync(async (req, res) => {
  const { managerComments } = req.body;
  const pr = await prService.approvePurchaseRequest(req.params.id, managerComments, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request approved successfully", pr));
});

const rejectPurchaseRequest = catchAsync(async (req, res) => {
  const { managerComments } = req.body;
  const pr = await prService.rejectPurchaseRequest(req.params.id, managerComments, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request rejected successfully", pr));
});

const deletePurchaseRequest = catchAsync(async (req, res) => {
  await prService.deletePurchaseRequest(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request deleted successfully"));
});

module.exports = {
  createPurchaseRequest,
  getPurchaseRequests,
  getPurchaseRequestById,
  updatePurchaseRequest,
  submitPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  deletePurchaseRequest
};
