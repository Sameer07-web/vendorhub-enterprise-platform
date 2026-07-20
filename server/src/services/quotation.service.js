const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { logEvent } = require('./audit.service');
const notificationService = require('./notification.service');

/**
 * Generate Next Quotation Number
 */
const generateQuotationNumber = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'quotationNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `QT-${String(counter.seq).padStart(6, '0')}`;
};

/**
 * Calculate total amount securely
 */
const calculateTotal = (subtotal, taxAmount = 0, shippingCost = 0, discount = 0) => {
  return (subtotal + taxAmount + shippingCost) - discount;
};

/**
 * Create a new Quotation
 */
const createQuotation = async (quotationBody, userId) => {
  const { rfq, vendor, subtotal, taxAmount, shippingCost, discount, validUntil } = quotationBody;

  // 1. Validate RFQ
  const rfqDoc = await RFQ.findOne({ _id: rfq, isDeleted: false });
  if (!rfqDoc) {
    throw new ApiError(404, 'RFQ not found or has been deleted');
  }

  if (!['SENT', 'PARTIALLY_RESPONDED'].includes(rfqDoc.status)) {
    throw new ApiError(400, `Quotation cannot be submitted. RFQ status is ${rfqDoc.status}`);
  }

  // 2. Validate Vendor
  const vendorDoc = await Vendor.findOne({ _id: vendor, isDeleted: false });
  if (!vendorDoc) {
    throw new ApiError(404, 'Vendor not found or has been deleted');
  }

  const isInvited = rfqDoc.vendors.some(vId => vId.toString() === vendor.toString());
  if (!isInvited) {
    throw new ApiError(403, 'Vendor was not invited to this RFQ');
  }

  // 3. Prevent Duplicate Quotations
  const existingQuotation = await Quotation.findOne({ rfq, vendor, isDeleted: false });
  if (existingQuotation) {
    throw new ApiError(409, 'Vendor has already submitted a quotation for this RFQ');
  }

  // 4. Validate Dates
  const quotationDate = new Date();
  if (validUntil && new Date(validUntil) < quotationDate) {
    throw new ApiError(400, 'validUntil cannot be in the past relative to quotationDate');
  }

  // 5. Calculate Total
  const totalAmount = calculateTotal(subtotal, taxAmount, shippingCost, discount);

  // 6. Generate Number & Snapshot
  const quotationNumber = await generateQuotationNumber();
  const vendorSnapshot = {
    vendorCode: vendorDoc.vendorCode,
    companyName: vendorDoc.companyName,
    category: vendorDoc.category
  };

  // 7. Save Quotation
  const quotation = await Quotation.create({
    ...quotationBody,
    quotationNumber,
    vendorSnapshot,
    quotationDate,
    totalAmount,
    createdBy: userId
  });

  // 8. Update RFQ Telemetry
  rfqDoc.quotationCount += 1;
  if (!rfqDoc.vendorResponses) {
    rfqDoc.vendorResponses = { totalVendors: rfqDoc.vendors.length, responded: 0, pending: rfqDoc.vendors.length };
  }
  rfqDoc.vendorResponses.responded += 1;
  rfqDoc.vendorResponses.pending -= 1;

  if (rfqDoc.status === 'SENT') {
    rfqDoc.status = 'PARTIALLY_RESPONDED';
    rfqDoc.statusHistory.push({
      status: 'PARTIALLY_RESPONDED',
      changedBy: userId,
      changedAt: new Date()
    });
  }

  // Check if all responded -> do we close?
  // User explicitly asked: "Do NOT automatically close unfinished procurement."
  // Leave in PARTIALLY_RESPONDED even if pending === 0.

  await rfqDoc.save();

  console.log(`[BUSINESS EVENT] Quotation Created: ${quotationNumber} for RFQ: ${rfqDoc.rfqNumber} by Vendor: ${vendorDoc.vendorCode}`);

  await logEvent({
    userId,
    action: "CREATE_QUOTATION",
    entityType: "Quotation",
    entityId: quotation._id,
    newValue: quotation.toObject(),
  });

  return quotation;
};

/**
 * Get Quotations with Pagination, Filtering, Sorting
 */
const getQuotations = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'Newest', search } = options;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false, ...filter };

  if (search) {
    const escaped = escapeRegex(search);
    query.$or = [
      { quotationNumber: { $regex: escaped, $options: 'i' } },
      { 'vendorSnapshot.companyName': { $regex: escaped, $options: 'i' } }
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sortBy === 'Oldest') sortOption = { createdAt: 1 };
  if (sortBy === 'Lowest Price') sortOption = { totalAmount: 1 };
  if (sortBy === 'Highest Price') sortOption = { totalAmount: -1 };
  if (sortBy === 'Delivery Days') sortOption = { deliveryDays: 1 };

  const quotations = await Quotation.find(query)
    .populate('rfq', 'rfqNumber title status')
    .populate('vendor', 'vendorCode companyName')
    .populate('createdBy', 'firstName lastName fullName email')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Quotation.countDocuments(query);

  return {
    quotations,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    total
  };
};

/**
 * Get Quotation By ID
 */
const getQuotationById = async (id) => {
  const quotation = await Quotation.findOne({ _id: id, isDeleted: false })
    .populate('rfq', 'rfqNumber title status')
    .populate('vendor', 'vendorCode companyName')
    .populate('createdBy', 'firstName lastName fullName email')
    .populate('reviewedBy', 'firstName lastName fullName email');

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  return quotation;
};

/**
 * Update Quotation
 */
const updateQuotation = async (id, updateBody, userId) => {
  const quotation = await getQuotationById(id);

  if (quotation.status !== 'SUBMITTED') {
    throw new ApiError(400, `Cannot update quotation with status ${quotation.status}`);
  }

  // Recalculate totals if financial fields change
  const subtotal = updateBody.subtotal ?? quotation.subtotal;
  const taxAmount = updateBody.taxAmount ?? quotation.taxAmount;
  const shippingCost = updateBody.shippingCost ?? quotation.shippingCost;
  const discount = updateBody.discount ?? quotation.discount;

  updateBody.totalAmount = calculateTotal(subtotal, taxAmount, shippingCost, discount);

  if (updateBody.validUntil && new Date(updateBody.validUntil) < new Date(quotation.quotationDate)) {
    throw new ApiError(400, 'validUntil cannot be before quotationDate');
  }

  const oldVal = quotation.toObject();
  Object.assign(quotation, updateBody);
  quotation.updatedBy = userId;

  await quotation.save();

  await logEvent({
    userId,
    action: "UPDATE_QUOTATION",
    entityType: "Quotation",
    entityId: id,
    oldValue: oldVal,
    newValue: quotation.toObject(),
  });

  return quotation;
};

/**
 * Review Quotation
 */
const reviewQuotation = async (id, reviewBody, userId) => {
  const quotation = await getQuotationById(id);

  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(quotation.status)) {
    throw new ApiError(400, `Cannot review quotation with status ${quotation.status}`);
  }

  quotation.status = 'UNDER_REVIEW';
  quotation.reviewComments = reviewBody.reviewComments;
  
  if (reviewBody.comparisonScore !== undefined) {
    quotation.comparisonScore = reviewBody.comparisonScore;
  }

  quotation.reviewedBy = userId;
  quotation.reviewedAt = new Date();
  const oldVal = quotation.toObject();
  quotation.updatedBy = userId;

  await quotation.save();

  console.log(`[BUSINESS EVENT] Quotation Reviewed: ${quotation.quotationNumber}`);

  await logEvent({
    userId,
    action: "REVIEW_QUOTATION",
    entityType: "Quotation",
    entityId: id,
    oldValue: oldVal,
    newValue: quotation.toObject(),
  });

  return quotation;
};

/**
 * Select Winning Quotation
 */
const selectWinningQuotation = async (id, userId) => {
  const quotation = await getQuotationById(id);

  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(quotation.status)) {
    throw new ApiError(400, `Cannot select quotation with status ${quotation.status}`);
  }

  const rfqId = quotation.rfq._id || quotation.rfq;

  // Check if there is already a winner for this RFQ
  const existingWinner = await Quotation.findOne({ rfq: rfqId, isWinner: true, isDeleted: false });
  if (existingWinner) {
    throw new ApiError(409, `A winning quotation (${existingWinner.quotationNumber}) has already been selected for this RFQ`);
  }

  const oldVal = quotation.toObject();
  // Set as Winner
  quotation.isWinner = true;
  quotation.status = 'SELECTED';
  quotation.updatedBy = userId;
  await quotation.save();

  // Bulk reject remaining
  await Quotation.updateMany(
    { rfq: rfqId, _id: { $ne: quotation._id }, isDeleted: false },
    { $set: { status: 'REJECTED', updatedBy: userId } }
  );

  console.log(`[BUSINESS EVENT] Quotation Selected: ${quotation.quotationNumber} for RFQ ${rfqId}`);

  await logEvent({
    userId,
    action: "AWARD_RFQ", // Matching the action requested: award RFQ
    entityType: "Quotation",
    entityId: quotation._id,
    oldValue: oldVal,
    newValue: quotation.toObject(),
  });

  // Notify RFQ Creator that a vendor was awarded
  if (quotation.rfq.createdBy && quotation.rfq.createdBy.toString() !== userId.toString()) {
    await notificationService.createNotification({
      recipient: quotation.rfq.createdBy,
      sender: userId,
      type: "RFQ_AWARDED",
      title: "RFQ Awarded",
      message: `Quotation ${quotation.quotationNumber} from ${quotation.vendor.companyName || quotation.vendorSnapshot.companyName} was awarded for RFQ ${quotation.rfq.rfqNumber}.`,
      priority: "HIGH",
      entityType: "RFQ",
      entityId: rfqId,
      actionUrl: `/app/rfqs/${rfqId}`,
      metadata: {
        rfqNumber: quotation.rfq.rfqNumber,
        title: quotation.rfq.title
      }
    });
  }

  return quotation;
};

/**
 * Soft Delete Quotation
 */
const deleteQuotation = async (id, userId) => {
  const quotation = await getQuotationById(id);

  if (quotation.status === 'SELECTED') {
    throw new ApiError(400, 'Cannot delete a winning quotation');
  }

  const oldVal = quotation.toObject();
  quotation.isDeleted = true;
  quotation.updatedBy = userId;
  await quotation.save();

  // Decrement RFQ counters
  const rfqDoc = await RFQ.findById(quotation.rfq._id || quotation.rfq);
  if (rfqDoc && rfqDoc.vendorResponses) {
    rfqDoc.quotationCount = Math.max(0, rfqDoc.quotationCount - 1);
    rfqDoc.vendorResponses.responded = Math.max(0, rfqDoc.vendorResponses.responded - 1);
    rfqDoc.vendorResponses.pending += 1;
    await rfqDoc.save();
  }

  console.log(`[BUSINESS EVENT] Quotation Deleted: ${quotation.quotationNumber}`);

  await logEvent({
    userId,
    action: "DELETE_QUOTATION",
    entityType: "Quotation",
    entityId: quotation._id,
    oldValue: oldVal,
  });

  return quotation;
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  reviewQuotation,
  selectWinningQuotation,
  deleteQuotation,
  calculateTotal
};
