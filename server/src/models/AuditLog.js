const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String, // e.g., 'CREATE_VENDOR', 'UPDATE_VENDOR', 'DELETE_VENDOR', 'APPROVE_PR', 'REJECT_PR', 'AWARD_RFQ'
      required: true,
    },
    entityType: {
      type: String, // e.g., 'Vendor', 'PurchaseRequest', 'RFQ', 'Quotation'
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
