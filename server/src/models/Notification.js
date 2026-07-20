const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "RFQ_INVITED",
        "RFQ_AWARDED",
        "PR_APPROVED",
        "PR_REJECTED",
        "PR_SUBMITTED",
        "VENDOR_CREATED",
        "VENDOR_UPDATED",
        "SYSTEM",
        "PASSWORD_RESET",
        "WELCOME",
        "BROADCAST",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional, e.g., SYSTEM notifications might not have a sender
    },
    entityType: {
      type: String,
      enum: ["Vendor", "PurchaseRequest", "RFQ", "Quotation", "User", "System"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance (Phase 10 requirements)
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
