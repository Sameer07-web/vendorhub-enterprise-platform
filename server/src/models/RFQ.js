const mongoose = require("mongoose");

const rfqSchema = new mongoose.Schema(
  {
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
    versionKey: false,
  }
);

const RFQ = mongoose.model("RFQ", rfqSchema);

module.exports = RFQ;
