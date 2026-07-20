const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const quotationService = require('../services/quotation.service');

const createQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Quotation created successfully', quotation));
});

const getQuotations = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.vendor) filter.vendor = req.query.vendor;
  if (req.query.rfq) filter.rfq = req.query.rfq;
  if (req.query.isWinner) filter.isWinner = req.query.isWinner === 'true';

  const options = {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 10,
    sortBy: req.query.sortBy,
    search: req.query.search
  };

  const result = await quotationService.getQuotations(filter, options);
  res.status(200).json(new ApiResponse(200, 'Quotations retrieved successfully', result));
});

const getQuotationById = catchAsync(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Quotation retrieved successfully', quotation));
});

const updateQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.updateQuotation(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Quotation updated successfully', quotation));
});

const reviewQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.reviewQuotation(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Quotation reviewed successfully', quotation));
});

const selectWinningQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.selectWinningQuotation(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Winning quotation selected successfully', quotation));
});

const deleteQuotation = catchAsync(async (req, res) => {
  await quotationService.deleteQuotation(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Quotation deleted successfully'));
});

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  reviewQuotation,
  selectWinningQuotation,
  deleteQuotation
};
