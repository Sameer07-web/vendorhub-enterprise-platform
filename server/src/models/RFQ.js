const mongoose = require("mongoose");

const rfqSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },
    purchaseRequestSnapshot: {
      requestNumber: { type: String, required: true },
      title: { type: String, required: true },
      department: { type: String, required: true },
      priority: { type: String, required: true },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "PARTIALLY_RESPONDED", "CLOSED", "CANCELLED"],
      default: "DRAFT",
    },
    quotationDeadline: {
      type: Date,
      required: true,
    },
    quotationCount: {
      type: Number,
      default: 0,
    },
    vendorResponses: {
      totalVendors: { type: Number, default: 0 },
      responded: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sentAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Compound indexes for multi-tenant performance
rfqSchema.index({ organization: 1, status: 1 });
rfqSchema.index({ organization: 1, isDeleted: 1 });
rfqSchema.index({ organization: 1, createdAt: -1 });
rfqSchema.index({ organization: 1, rfqNumber: 1 }, { unique: true });

// Indexes for performance optimization
rfqSchema.index({ isDeleted: 1, status: 1 });
rfqSchema.index({ purchaseRequest: 1 });

const RFQ = mongoose.model("RFQ", rfqSchema);

module.exports = RFQ;
