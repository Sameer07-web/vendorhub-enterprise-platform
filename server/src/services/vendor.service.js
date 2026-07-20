const Vendor = require("../models/Vendor");
const Counter = require("../models/Counter");
const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");
const { logEvent } = require("./audit.service");

/**
 * Generate Next Vendor Code safely using Counters collection
 */
const generateVendorCode = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "vendorId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  return `VND-${counter.seq.toString().padStart(4, "0")}`;
};

/**
 * Helper to check duplicates with normalized fields
 */
const checkDuplicates = async (companyName, email, gstNumber, excludeVendorId = null) => {
  // Normalize strings for duplicate checks
  const normCompany = companyName ? companyName.trim().replace(/\s+/g, ' ').toLowerCase() : null;
  const normEmail = email ? email.trim().toLowerCase() : null;
  const normGst = gstNumber ? gstNumber.replace(/\s+/g, '').toUpperCase() : null;

  const query = {
    isDeleted: false,
    $or: []
  };

  if (excludeVendorId) {
    query._id = { $ne: excludeVendorId };
  }

  // We have to use regex for case-insensitive exact match on company name if not explicitly stored normalized
  if (normCompany) {
    query.$or.push({ companyName: { $regex: new RegExp(`^${escapeRegex(normCompany)}$`, "i") } });
  }
  if (normEmail) {
    query.$or.push({ email: normEmail });
  }
  if (normGst) {
    query.$or.push({ gstNumber: normGst });
  }

  if (query.$or.length === 0) return;

  const duplicates = await Vendor.find(query);
  
  for (const dup of duplicates) {
    if (normCompany && dup.companyName.trim().replace(/\s+/g, ' ').toLowerCase() === normCompany) {
      throw new ApiError(409, "Company Name already exists");
    }
    if (normEmail && dup.email.trim().toLowerCase() === normEmail) {
      throw new ApiError(409, "Email already exists");
    }
    if (normGst && dup.gstNumber.replace(/\s+/g, '').toUpperCase() === normGst) {
      throw new ApiError(409, "GST Number already exists");
    }
  }
};

/**
 * Create a new Vendor
 */
const createVendor = async (vendorData, userId) => {
  await checkDuplicates(vendorData.companyName, vendorData.email, vendorData.gstNumber);

  const vendorCode = await generateVendorCode();

  // Normalize before save
  const dataToSave = {
    ...vendorData,
    vendorCode,
    companyName: vendorData.companyName.trim().replace(/\s+/g, ' '),
    email: vendorData.email.trim().toLowerCase(),
    gstNumber: vendorData.gstNumber.replace(/\s+/g, '').toUpperCase(),
    createdBy: userId,
    updatedBy: userId,
    rating: 0, // Enforce rating 0 initially
  };

  const vendor = await Vendor.create(dataToSave);

  console.log(`[LOG] Vendor Created: ${vendor._id} by User: ${userId} at ${new Date().toISOString()}`);

  await logEvent({
    userId,
    action: "CREATE_VENDOR",
    entityType: "Vendor",
    entityId: vendor._id,
    newValue: vendor.toObject(),
  });

  return vendor;
};

/**
 * Get all Vendors with Search, Sort, Filter, and Pagination
 */
const getVendors = async (query) => {
  const { 
    search, 
    status, 
    category, 
    sort = "Newest", 
    page = 1, 
    limit = 10 
  } = query;

  // Build filter query
  const filter = { isDeleted: false };

  if (status) {
    filter.status = status;
  }
  if (category) {
    filter.vendorCategory = category;
  }

  // Search logic
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { vendorCode: { $regex: escaped, $options: "i" } },
      { companyName: { $regex: escaped, $options: "i" } },
      { gstNumber: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  // Sorting logic
  let sortObj = { createdAt: -1 };
  if (sort === "Oldest") sortObj = { createdAt: 1 };
  else if (sort === "Company Name") sortObj = { companyName: 1 };
  else if (sort === "Rating") sortObj = { rating: -1 };

  // Pagination logic
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const vendors = await Vendor.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");

  const total = await Vendor.countDocuments(filter);

  return {
    vendors,
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Get Vendor by ID
 */
const getVendorById = async (vendorId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, isDeleted: false })
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return vendor;
};

/**
 * Update Vendor
 */
const updateVendor = async (vendorId, updateData, userId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, isDeleted: false });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  await checkDuplicates(
    updateData.companyName || null,
    updateData.email || null,
    updateData.gstNumber || null,
    vendorId
  );

  // Normalize specific fields if present
  if (updateData.companyName) updateData.companyName = updateData.companyName.trim().replace(/\s+/g, ' ');
  if (updateData.email) updateData.email = updateData.email.trim().toLowerCase();
  if (updateData.gstNumber) updateData.gstNumber = updateData.gstNumber.replace(/\s+/g, '').toUpperCase();

  const oldVal = vendor.toObject();
  updateData.updatedBy = userId;

  const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
    new: true,
    runValidators: true,
  });

  console.log(`[LOG] Vendor Updated: ${vendorId} by User: ${userId} at ${new Date().toISOString()}`);

  await logEvent({
    userId,
    action: "UPDATE_VENDOR",
    entityType: "Vendor",
    entityId: vendorId,
    oldValue: oldVal,
    newValue: updatedVendor.toObject(),
  });

  return updatedVendor;
};

/**
 * Check if vendor is referenced elsewhere (Placeholder for future modules)
 */
const checkVendorReferences = async (vendorId) => {
  // Placeholder: In the future, check Purchase Orders, Invoices, etc.
  // const hasPOs = await PurchaseOrder.exists({ vendor: vendorId });
  // if (hasPOs) return true;
  return false;
};

/**
 * Soft Delete Vendor
 */
const deleteVendor = async (vendorId, userId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, isDeleted: false });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const isReferenced = await checkVendorReferences(vendorId);
  if (isReferenced) {
    throw new ApiError(400, "Cannot delete vendor as it is referenced in other modules");
  }

  const oldVal = vendor.toObject();
  vendor.isDeleted = true;
  vendor.updatedBy = userId;
  await vendor.save();

  console.log(`[LOG] Vendor Deleted (Soft): ${vendorId} by User: ${userId} at ${new Date().toISOString()}`);

  await logEvent({
    userId,
    action: "DELETE_VENDOR",
    entityType: "Vendor",
    entityId: vendorId,
    oldValue: oldVal,
  });

  return true;
};

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
