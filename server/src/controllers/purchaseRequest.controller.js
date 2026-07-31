const purchaseRequestService = require("../services/purchaseRequest.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const createPurchaseRequest = catchAsync(async (req, res) => {
  const pr = await purchaseRequestService.createPurchaseRequest(req.organization._id, req.body, req.user);
  res.status(201).json(new ApiResponse(201, "Purchase Request created successfully", pr));
});

const getPurchaseRequests = catchAsync(async (req, res) => {
  const result = await purchaseRequestService.getPurchaseRequests(req.organization._id, req.query, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Requests fetched successfully", result));
});

const getPurchaseRequestById = catchAsync(async (req, res) => {
  const pr = await purchaseRequestService.getPurchaseRequestById(req.organization._id, req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request details fetched successfully", pr));
});

const updatePurchaseRequest = catchAsync(async (req, res) => {
  const pr = await purchaseRequestService.updatePurchaseRequest(req.organization._id, req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request updated successfully", pr));
});

const submitPurchaseRequest = catchAsync(async (req, res) => {
  const pr = await purchaseRequestService.submitPurchaseRequest(req.organization._id, req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request submitted for approval", pr));
});

const approvePurchaseRequest = catchAsync(async (req, res) => {
  const { comments } = req.body;
  const pr = await purchaseRequestService.approvePurchaseRequest(req.organization._id, req.params.id, comments, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request approved", pr));
});

const rejectPurchaseRequest = catchAsync(async (req, res) => {
  const { comments } = req.body;
  const pr = await purchaseRequestService.rejectPurchaseRequest(req.organization._id, req.params.id, comments, req.user);
  res.status(200).json(new ApiResponse(200, "Purchase Request rejected", pr));
});

const deletePurchaseRequest = catchAsync(async (req, res) => {
  await purchaseRequestService.deletePurchaseRequest(req.organization._id, req.params.id, req.user);
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
