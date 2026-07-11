const vendorService = require("../services/vendor.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const createVendor = catchAsync(async (req, res) => {
  const vendor = await vendorService.createVendor(req.body, req.user._id);

  res.status(201).json(
    new ApiResponse(201, "Vendor created successfully", vendor)
  );
});

const getVendors = catchAsync(async (req, res) => {
  const result = await vendorService.getVendors(req.query);

  res.status(200).json(
    new ApiResponse(200, "Vendors fetched successfully", result)
  );
});

const getVendorById = catchAsync(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, "Vendor details fetched successfully", vendor)
  );
});

const updateVendor = catchAsync(async (req, res) => {
  const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user._id);

  res.status(200).json(
    new ApiResponse(200, "Vendor updated successfully", vendor)
  );
});

const deleteVendor = catchAsync(async (req, res) => {
  await vendorService.deleteVendor(req.params.id, req.user._id);

  res.status(200).json(
    new ApiResponse(200, "Vendor deleted successfully")
  );
});

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
