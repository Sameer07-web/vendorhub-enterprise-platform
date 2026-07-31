const RFQRepository = require("../repositories/RFQRepository");
const PurchaseRequestRepository = require("../repositories/PurchaseRequestRepository");
const VendorRepository = require("../repositories/VendorRepository");
const Counter = require("../models/Counter");
const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");
const { logEvent } = require("./audit.service");
const notificationService = require("./notification.service");
const User = require("../models/User");
const TenantReferenceValidator = require("../utils/TenantReferenceValidator");

/**
 * Generate Next RFQ Code
 */
const generateRFQCode = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "rfqId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `RFQ-${counter.seq.toString().padStart(6, "0")}`;
};

/**
 * Validate Purchase Request for RFQ creation
 */
const validatePurchaseRequest = async (organizationId, prId, ignoreDuplicateCheck = false) => {
  const pr = await TenantReferenceValidator.validatePurchaseRequest(organizationId, prId);
  if (pr.status !== "APPROVED") {
    throw new ApiError(400, "Purchase Request must be in APPROVED status to generate an RFQ");
  }

  if (!ignoreDuplicateCheck) {
    const activeRFQ = await RFQRepository.findOne(organizationId, {
      purchaseRequest: prId,
      status: { $in: ["DRAFT", "SENT", "PARTIALLY_RESPONDED"] },
      isDeleted: false,
    });
    if (activeRFQ) {
      throw new ApiError(409, `An active RFQ (${activeRFQ.rfqNumber}) already exists for this Purchase Request`);
    }
  }

  return pr;
};

/**
 * Validate Vendors Array
 */
const validateVendors = async (organizationId, vendorIds) => {
  if (!vendorIds || vendorIds.length === 0) {
    throw new ApiError(400, "At least one vendor must be selected");
  }
  if (vendorIds.length > 10) {
    throw new ApiError(400, "Maximum 10 vendors allowed");
  }

  const uniqueVendorIds = [...new Set(vendorIds.map((id) => id.toString()))];
  if (uniqueVendorIds.length !== vendorIds.length) {
    throw new ApiError(400, "Duplicate vendors are not allowed");
  }

  const vendors = await TenantReferenceValidator.validateVendors(organizationId, uniqueVendorIds);

  for (const vendor of vendors) {
    if (vendor.status !== "Active") {
      throw new ApiError(400, `Vendor ${vendor.companyName} is not active`);
    }
  }

  return uniqueVendorIds;
};

/**
 * Create RFQ
 */
const createRFQ = async (organizationId, rfqData, user) => {
  const { purchaseRequest: prId, vendors, title, description, quotationDeadline } = rfqData;

  const pr = await validatePurchaseRequest(organizationId, prId);
  const validatedVendors = await validateVendors(organizationId, vendors);

  const rfqNumber = await generateRFQCode();

  const purchaseRequestSnapshot = {
    requestNumber: pr.requestNumber,
    title: pr.title,
    department: pr.department,
    priority: pr.priority,
  };

  const newRFQ = await RFQRepository.create(organizationId, {
    rfqNumber,
    purchaseRequest: prId,
    purchaseRequestSnapshot,
    title,
    description,
    vendors: validatedVendors,
    status: "DRAFT",
    quotationDeadline,
    vendorResponses: {
      totalVendors: validatedVendors.length,
      responded: 0,
      pending: validatedVendors.length,
    },
    createdBy: user._id,
    updatedBy: user._id,
    statusHistory: [
      {
        status: "DRAFT",
        changedBy: user._id,
        changedAt: new Date(),
      },
    ],
  });

  console.log(`[LOG] RFQ Created: ${newRFQ.rfqNumber} for PR-${pr.requestNumber} in Org: ${organizationId} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    organizationId,
    userId: user._id,
    action: "CREATE_RFQ",
    entityType: "RFQ",
    entityId: newRFQ._id,
    newValue: newRFQ.toObject ? newRFQ.toObject() : newRFQ,
  });

  return newRFQ;
};

/**
 * Update Draft RFQ
 */
const updateRFQ = async (organizationId, id, updateData, user) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  if (rfq.status !== "DRAFT") {
    throw new ApiError(400, "Only DRAFT RFQs can be updated");
  }

  if (updateData.vendors) {
    const validatedVendors = await validateVendors(organizationId, updateData.vendors);
    rfq.vendors = validatedVendors;
    rfq.vendorResponses.totalVendors = validatedVendors.length;
    rfq.vendorResponses.pending = validatedVendors.length;
    rfq.vendorResponses.responded = 0;
  }

  if (updateData.title) rfq.title = updateData.title;
  if (updateData.description !== undefined) rfq.description = updateData.description;
  if (updateData.quotationDeadline) rfq.quotationDeadline = updateData.quotationDeadline;

  const oldVal = rfq.toObject ? rfq.toObject() : rfq;
  rfq.updatedBy = user._id;
  await rfq.save();

  await logEvent({
    organizationId,
    userId: user._id,
    action: "UPDATE_RFQ",
    entityType: "RFQ",
    entityId: id,
    oldValue: oldVal,
    newValue: rfq.toObject ? rfq.toObject() : rfq,
  });

  return rfq;
};

/**
 * Get RFQs
 */
const getRFQs = async (organizationId, query) => {
  const { 
    search, 
    status, 
    createdBy, 
    quotationDeadline, 
    sort = "Newest", 
    page = 1, 
    limit = 10 
  } = query;

  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (createdBy) filter.createdBy = createdBy;
  if (quotationDeadline) filter.quotationDeadline = { $lte: new Date(quotationDeadline) };

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { rfqNumber: { $regex: escaped, $options: "i" } },
      { title: { $regex: escaped, $options: "i" } },
      { "purchaseRequestSnapshot.requestNumber": { $regex: escaped, $options: "i" } }
    ];
  }

  let sortObj = { createdAt: -1 };
  if (sort === "Oldest") sortObj = { createdAt: 1 };
  else if (sort === "Deadline") sortObj = { quotationDeadline: 1 };
  else if (sort === "Created Date") sortObj = { createdAt: -1 };

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const rfqs = await RFQRepository.findMany(organizationId, filter, null, {
    sort: sortObj,
    skip,
    limit: pageSize,
    populate: [
      { path: "purchaseRequest", select: "requestNumber title status" },
      { path: "vendors", select: "companyName vendorCode status" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" }
    ]
  });

  const total = await RFQRepository.count(organizationId, filter);

  return {
    rfqs,
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Get RFQ By ID
 */
const getRFQById = async (organizationId, id) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false }, null, {
    populate: [
      { path: "purchaseRequest", select: "requestNumber title status department requiredDate estimatedCost" },
      { path: "vendors", select: "companyName vendorCode status email contactPerson" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "statusHistory.changedBy", select: "fullName email" }
    ]
  });

  if (!rfq) throw new ApiError(404, "RFQ not found");
  return rfq;
};

/**
 * Send RFQ (DRAFT -> SENT)
 */
const sendRFQ = async (organizationId, id, user) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  if (rfq.status !== "DRAFT") {
    throw new ApiError(400, `Cannot send RFQ in ${rfq.status} status. Must be DRAFT.`);
  }

  rfq.status = "SENT";
  rfq.sentAt = new Date();
  rfq.updatedBy = user._id;
  rfq.statusHistory.push({
    status: "SENT",
    changedBy: user._id,
    changedAt: new Date(),
  });

  const oldVal = rfq.toObject ? rfq.toObject() : rfq;
  await rfq.save();
  console.log(`[LOG] RFQ Sent: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    organizationId,
    userId: user._id,
    action: "SEND_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject ? rfq.toObject() : rfq,
  });

  // Notify Managers that RFQ has been sent
  const managers = await User.find({ organization: organizationId, role: { $in: ["Manager", "Admin"] }, isActive: true });
  const notificationPromises = managers.map(mgr => 
    notificationService.createNotification(organizationId, {
      recipient: mgr._id,
      sender: user._id,
      type: "RFQ_INVITED",
      title: "RFQ Sent to Vendors",
      message: `RFQ ${rfq.rfqNumber} has been sent to ${rfq.vendors.length} vendors for PR-${rfq.purchaseRequestSnapshot.requestNumber}.`,
      priority: "MEDIUM",
      entityType: "RFQ",
      entityId: rfq._id,
      actionUrl: `/app/rfqs/${rfq._id}`,
      metadata: {
        rfqNumber: rfq.rfqNumber,
        title: rfq.title
      }
    })
  );
  await Promise.all(notificationPromises);

  return rfq;
};

/**
 * Close RFQ (SENT/PARTIALLY_RESPONDED -> CLOSED)
 */
const closeRFQ = async (organizationId, id, user) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  if (!["SENT", "PARTIALLY_RESPONDED"].includes(rfq.status)) {
    throw new ApiError(400, `Cannot close RFQ in ${rfq.status} status. Must be SENT or PARTIALLY_RESPONDED.`);
  }

  rfq.status = "CLOSED";
  rfq.closedAt = new Date();
  rfq.updatedBy = user._id;
  rfq.statusHistory.push({
    status: "CLOSED",
    changedBy: user._id,
    changedAt: new Date(),
  });

  const oldVal = rfq.toObject ? rfq.toObject() : rfq;
  await rfq.save();
  console.log(`[LOG] RFQ Closed: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    organizationId,
    userId: user._id,
    action: "CLOSE_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject ? rfq.toObject() : rfq,
  });

  return rfq;
};

/**
 * Cancel RFQ (DRAFT -> CANCELLED)
 */
const cancelRFQ = async (organizationId, id, user) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  if (rfq.status !== "DRAFT") {
    throw new ApiError(400, `Cannot cancel RFQ in ${rfq.status} status. Only DRAFT RFQs can be cancelled.`);
  }

  rfq.status = "CANCELLED";
  rfq.updatedBy = user._id;
  rfq.statusHistory.push({
    status: "CANCELLED",
    changedBy: user._id,
    changedAt: new Date(),
  });

  const oldVal = rfq.toObject ? rfq.toObject() : rfq;
  await rfq.save();
  console.log(`[LOG] RFQ Cancelled: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    organizationId,
    userId: user._id,
    action: "CANCEL_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject ? rfq.toObject() : rfq,
  });

  return rfq;
};

/**
 * Delete RFQ
 */
const deleteRFQ = async (organizationId, id, user) => {
  const rfq = await RFQRepository.findOne(organizationId, { _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  const oldVal = rfq.toObject ? rfq.toObject() : rfq;
  rfq.isDeleted = true;
  rfq.updatedBy = user._id;
  await rfq.save();

  console.log(`[LOG] RFQ Deleted: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    organizationId,
    userId: user._id,
    action: "DELETE_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
  });

  return true;
};

module.exports = {
  validatePurchaseRequest,
  validateVendors,
  createRFQ,
  updateRFQ,
  getRFQs,
  getRFQById,
  sendRFQ,
  closeRFQ,
  cancelRFQ,
  deleteRFQ
};
