const PurchaseRequest = require("../models/PurchaseRequest");
const Counter = require("../models/Counter");
const Vendor = require("../models/Vendor");
const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");
const { logEvent } = require("./audit.service");
const notificationService = require("./notification.service");
const User = require("../models/User");

/**
 * Generate Next PR Code safely using Counters collection
 */
const generatePRCode = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "prId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `PR-${counter.seq.toString().padStart(6, "0")}`;
};

/**
 * Check vendor validity
 */
const checkVendorValidity = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.isDeleted) {
    throw new ApiError(400, "Selected vendor does not exist");
  }
  if (vendor.status !== "Active") {
    throw new ApiError(400, "Selected vendor is not active");
  }
};

/**
 * Create PR
 */
const createPurchaseRequest = async (prData, user) => {
  await checkVendorValidity(prData.vendor);

  const requestNumber = await generatePRCode();

  const dataToSave = {
    ...prData,
    requestNumber,
    status: "DRAFT",
    createdBy: user._id,
    updatedBy: user._id,
  };

  const pr = await PurchaseRequest.create(dataToSave);
  console.log(`[LOG] Purchase Request Created: ${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "CREATE_PR",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    newValue: pr.toObject(),
  });

  return pr;
};

/**
 * Get PRs (with search, filter, pagination, RBAC)
 */
const getPurchaseRequests = async (query, user) => {
  const {
    search,
    status,
    priority,
    department,
    createdBy,
    sort = "Newest",
    page = 1,
    limit = 10
  } = query;

  const filter = { isDeleted: false };

  // RBAC: Employees can only view their own requests
  if (user.role === "Employee") {
    filter.createdBy = user._id;
  } else if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (department) filter.department = department;

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { requestNumber: { $regex: escaped, $options: "i" } },
      { title: { $regex: escaped, $options: "i" } },
      { department: { $regex: escaped, $options: "i" } },
    ];
  }

  let sortObj = { createdAt: -1 };
  if (sort === "Oldest") sortObj = { createdAt: 1 };
  else if (sort === "Priority") sortObj = { priority: -1 }; // Needs mapping if string
  else if (sort === "Required Date") sortObj = { requiredDate: 1 };

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const requests = await PurchaseRequest.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(pageSize)
    .populate("vendor", "companyName vendorCode")
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email");

  const total = await PurchaseRequest.countDocuments(filter);

  return {
    purchaseRequests: requests,
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Get PR by ID
 */
const getPurchaseRequestById = async (id, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false })
    .populate("vendor", "companyName vendorCode gstNumber status")
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email");

  if (!pr) throw new ApiError(404, "Purchase Request not found");

  if (user.role === "Employee" && pr.createdBy._id.toString() !== user._id.toString()) {
    throw new ApiError(403, "You do not have permission to view this request");
  }

  return pr;
};

/**
 * Update PR
 */
const updatePurchaseRequest = async (id, updateData, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false });
  if (!pr) throw new ApiError(404, "Purchase Request not found");

  if (pr.createdBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "Only the creator can edit this request");
  }

  if (pr.status !== "DRAFT") {
    throw new ApiError(400, "Only draft requests can be edited");
  }

  if (updateData.vendor) {
    await checkVendorValidity(updateData.vendor);
  }

  const oldVal = pr.toObject();
  updateData.updatedBy = user._id;

  const updatedPr = await PurchaseRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  await logEvent({
    userId: user._id,
    action: "UPDATE_PR",
    entityType: "PurchaseRequest",
    entityId: id,
    oldValue: oldVal,
    newValue: updatedPr.toObject(),
  });

  return updatedPr;
};

/**
 * Submit PR
 */
const submitPurchaseRequest = async (id, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false });
  if (!pr) throw new ApiError(404, "Purchase Request not found");

  if (pr.createdBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "Only the creator can submit this request");
  }

  if (pr.status !== "DRAFT") {
    throw new ApiError(400, `Cannot submit request in ${pr.status} status`);
  }

  const oldVal = pr.toObject();
  pr.status = "PENDING_APPROVAL";
  pr.submittedAt = new Date();
  pr.updatedBy = user._id;
  await pr.save();

  console.log(`[LOG] Purchase Request Submitted: ${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "SUBMIT_PR",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    oldValue: oldVal,
    newValue: pr.toObject(),
  });

  // Notify Managers
  const managers = await User.find({ role: { $in: ["Manager", "Admin"] }, isActive: true });
  const notificationPromises = managers.map(mgr => 
    notificationService.createNotification({
      recipient: mgr._id,
      sender: user._id,
      type: "PR_SUBMITTED",
      title: "New Purchase Request Submitted",
      message: `PR ${pr.requestNumber} has been submitted by ${user.fullName || "User"} and is pending approval.`,
      priority: "MEDIUM",
      entityType: "PurchaseRequest",
      entityId: pr._id,
      actionUrl: `/app/purchase-requests/${pr._id}`,
      metadata: {
        prNumber: pr.requestNumber,
        title: pr.title
      }
    })
  );
  await Promise.all(notificationPromises);

  return pr;
};

/**
 * Approve PR
 */
const approvePurchaseRequest = async (id, comments, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false });
  if (!pr) throw new ApiError(404, "Purchase Request not found");

  if (pr.status !== "PENDING_APPROVAL") {
    throw new ApiError(400, `Cannot approve request in ${pr.status} status. Must be PENDING_APPROVAL.`);
  }

  const oldVal = pr.toObject();
  pr.status = "APPROVED";
  pr.approvedBy = user._id;
  pr.approvedAt = new Date();
  pr.updatedBy = user._id;
  if (comments) pr.managerComments = comments;

  await pr.save();

  console.log(`[LOG] Purchase Request Approved: ${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "APPROVE_PR",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    oldValue: oldVal,
    newValue: pr.toObject(),
  });

  // Notify Creator
  await notificationService.createNotification({
    recipient: pr.createdBy,
    sender: user._id,
    type: "PR_APPROVED",
    title: "Purchase Request Approved",
    message: `Your Purchase Request ${pr.requestNumber} has been approved.`,
    priority: "HIGH",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    actionUrl: `/app/purchase-requests/${pr._id}`,
    metadata: {
      prNumber: pr.requestNumber,
      title: pr.title
    }
  });

  return pr;
};

/**
 * Reject PR
 */
const rejectPurchaseRequest = async (id, comments, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false });
  if (!pr) throw new ApiError(404, "Purchase Request not found");

  if (pr.status !== "PENDING_APPROVAL") {
    throw new ApiError(400, `Cannot reject request in ${pr.status} status. Must be PENDING_APPROVAL.`);
  }

  if (!comments || comments.trim() === "") {
    throw new ApiError(400, "Manager comments are required when rejecting a request.");
  }

  const oldVal = pr.toObject();
  pr.status = "REJECTED";
  pr.approvedBy = user._id; // capturing the reviewer
  pr.updatedBy = user._id;
  pr.managerComments = comments;

  await pr.save();

  console.log(`[LOG] Purchase Request Rejected: ${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "REJECT_PR",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    oldValue: oldVal,
    newValue: pr.toObject(),
  });

  // Notify Creator
  await notificationService.createNotification({
    recipient: pr.createdBy,
    sender: user._id,
    type: "PR_REJECTED",
    title: "Purchase Request Rejected",
    message: `Your Purchase Request ${pr.requestNumber} has been rejected.`,
    priority: "HIGH",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    actionUrl: `/app/purchase-requests/${pr._id}`,
    metadata: {
      prNumber: pr.requestNumber,
      title: pr.title
    }
  });

  return pr;
};

/**
 * Delete PR (Soft)
 */
const deletePurchaseRequest = async (id, user) => {
  const pr = await PurchaseRequest.findOne({ _id: id, isDeleted: false });
  if (!pr) throw new ApiError(404, "Purchase Request not found");

  const oldVal = pr.toObject();
  pr.isDeleted = true;
  pr.updatedBy = user._id;
  await pr.save();

  console.log(`[LOG] Purchase Request Deleted: ${pr.requestNumber} by User: ${user._id} at ${new Date().toISOString()}`);

  await logEvent({
    userId: user._id,
    action: "DELETE_PR",
    entityType: "PurchaseRequest",
    entityId: pr._id,
    oldValue: oldVal,
  });

  return true;
};

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
