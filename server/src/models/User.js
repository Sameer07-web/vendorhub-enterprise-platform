const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Manager", "Employee"],
      default: "Employee",
    },

    department: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    notificationPreferences: {
      email: {
        enabled: { type: Boolean, default: true },
        digest: { type: String, enum: ["instant", "daily", "weekly"], default: "instant" }
      },
      inApp: {
        enabled: { type: Boolean, default: true }
      },
      categories: {
        purchaseRequests: { type: Boolean, default: true },
        rfqs: { type: Boolean, default: true },
        vendors: { type: Boolean, default: true },
        quotations: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        broadcasts: { type: Boolean, default: true }
      }
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;