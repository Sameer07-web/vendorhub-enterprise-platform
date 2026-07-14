const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      index: true
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
      index: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    vendorSnapshot: {
      vendorCode: { type: String, required: true },
      companyName: { type: String, required: true },
      category: { type: String }
    },
    quotationDate: {
      type: Date,
      default: Date.now
    },
    currency: {
      type: String,
      default: 'USD'
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryDays: {
      type: Number
    },
    paymentTerms: {
      type: String
    },
    validUntil: {
      type: Date
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'SELECTED', 'REJECTED', 'EXPIRED'],
      default: 'SUBMITTED'
    },
    comparisonScore: {
      type: Number,
      default: 0
    },
    isWinner: {
      type: Boolean,
      default: false,
      index: true
    },
    purchaseOrderGenerated: {
      type: Boolean,
      default: false
    },
    evaluation: {
      priceScore: { type: Number, default: 0 },
      deliveryScore: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 }
    },
    reviewComments: {
      type: String
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for common queries
quotationSchema.index({ rfq: 1, vendor: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
quotationSchema.index({ status: 1 });
quotationSchema.index({ quotationDate: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);
