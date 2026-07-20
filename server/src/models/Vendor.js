const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    vendorCategory: {
      type: String,
      enum: ["Raw Material", "IT", "Office Supplies", "Logistics", "Maintenance", "Consulting"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
    rating: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
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

// Indexes for performance optimization
vendorSchema.index({ isDeleted: 1, status: 1 });
vendorSchema.index({ vendorCategory: 1 });

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
