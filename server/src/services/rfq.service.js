const RFQ = require("../models/RFQ");
const PurchaseRequest = require("../models/PurchaseRequest");
const Vendor = require("../models/Vendor");
const Counter = require("../models/Counter");
const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");
const { logEvent } = require("./audit.service");
const notificationService = require("./notification.service");
const User = require("../models/User");

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
const validatePurchaseRequest = async (prId, ignoreDuplicateCheck = false) => {
  const pr = await PurchaseRequest.findOne({ _id: prId, isDeleted: false });
  if (!pr) {
    throw new ApiError(404, "Purchase Request not found");
  }
  if (pr.status !== "APPROVED") {
    throw new ApiError(400, "Purchase Request must be in APPROVED status to generate an RFQ");
  }

  if (!ignoreDuplicateCheck) {
    const activeRFQ = await RFQ.findOne({
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
const validateVendors = async (vendorIds) => {
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

  const vendors = await Vendor.find({ _id: { $in: uniqueVendorIds } });
  
  if (vendors.length !== uniqueVendorIds.length) {
    throw new ApiError(400, "One or more selected vendors do not exist");
  }

  for (const vendor of vendors) {
    if (vendor.isDeleted) {
      throw new ApiError(400, `Vendor ${vendor.companyName} is deleted and cannot be selected`);
    }
    if (vendor.status !== "Active") {
      throw new ApiError(400, `Vendor ${vendor.companyName} is not active`);
    }
  }

  return uniqueVendorIds;
};

/**
 * Create RFQ
 */
const createRFQ = async (rfqData, user) => {
  const { purchaseRequest: prId, vendors, title, description, quotationDeadline } = rfqData;

  const pr = await validatePurchaseRequest(prId);
  const validatedVendors = await validateVendors(vendors);

  const rfqNumber = await generateRFQCode();

  const purchaseRequestSnapshot = {
    requestNumber: pr.requestNumber,
    title: pr.title,
    department: pr.department,
    priority: pr.priority,
  };

  const newRFQ = await RFQ.create({
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

  console.log(`[LOG] RFQ Created: ${newRFQ.rfqNumber} for PR-${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "CREATE_RFQ",
    entityType: "RFQ",
    entityId: newRFQ._id,
    newValue: newRFQ.toObject(),
  });

  return newRFQ;
};

/**
 * Update Draft RFQ
 */
const updateRFQ = async (id, updateData, user) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  if (rfq.status !== "DRAFT") {
    throw new ApiError(400, "Only DRAFT RFQs can be updated");
  }

  if (updateData.vendors) {
    const validatedVendors = await validateVendors(updateData.vendors);
    rfq.vendors = validatedVendors;
    rfq.vendorResponses.totalVendors = validatedVendors.length;
    rfq.vendorResponses.pending = validatedVendors.length;
    rfq.vendorResponses.responded = 0; // assuming draft state means 0 responses
  }

  if (updateData.title) rfq.title = updateData.title;
  if (updateData.description !== undefined) rfq.description = updateData.description;
  if (updateData.quotationDeadline) rfq.quotationDeadline = updateData.quotationDeadline;

  const oldVal = rfq.toObject();
  rfq.updatedBy = user._id;
  await rfq.save();

  await logEvent({
    userId: user._id,
    action: "UPDATE_RFQ",
    entityType: "RFQ",
    entityId: id,
    oldValue: oldVal,
    newValue: rfq.toObject(),
  });

  return rfq;
};

/**
 * Get RFQs
 */
const getRFQs = async (query) => {
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

  const rfqs = await RFQ.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(pageSize)
    .populate("purchaseRequest", "requestNumber title status")
    .populate("vendors", "companyName vendorCode status")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");

  const total = await RFQ.countDocuments(filter);

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
const getRFQById = async (id) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false })
    .populate("purchaseRequest", "requestNumber title status department requiredDate estimatedCost")
    .populate("vendors", "companyName vendorCode status email contactPerson")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email")
    .populate("statusHistory.changedBy", "fullName email");

  if (!rfq) throw new ApiError(404, "RFQ not found");
  return rfq;
};

/**
 * Send RFQ (DRAFT -> SENT)
 */
const sendRFQ = async (id, user) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false });
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

  const oldVal = rfq.toObject();
  await rfq.save();
  console.log(`[LOG] RFQ Sent: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "SEND_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject(),
  });

  // Notify Managers that RFQ has been sent
  const managers = await User.find({ role: { $in: ["Manager", "Admin"] }, isActive: true });
  const notificationPromises = managers.map(mgr => 
    notificationService.createNotification({
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
const closeRFQ = async (id, user) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false });
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

  const oldVal = rfq.toObject();
  await rfq.save();
  console.log(`[LOG] RFQ Closed: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "CLOSE_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject(),
  });

  return rfq;
};

/**
 * Cancel RFQ (DRAFT -> CANCELLED)
 */
const cancelRFQ = async (id, user) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false });
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

  const oldVal = rfq.toObject();
  await rfq.save();
  console.log(`[LOG] RFQ Cancelled: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "CANCEL_RFQ",
    entityType: "RFQ",
    entityId: rfq._id,
    oldValue: oldVal,
    newValue: rfq.toObject(),
  });

  return rfq;
};

/**
 * Delete RFQ (Soft Delete, Admin only typically handled by middleware)
 */
const deleteRFQ = async (id, user) => {
  const rfq = await RFQ.findOne({ _id: id, isDeleted: false });
  if (!rfq) throw new ApiError(404, "RFQ not found");

  const oldVal = rfq.toObject();
  rfq.isDeleted = true;
  rfq.updatedBy = user._id;
  await rfq.save();

  console.log(`[LOG] RFQ Deleted: ${rfq.rfqNumber} for PR-${rfq.purchaseRequestSnapshot.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
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
