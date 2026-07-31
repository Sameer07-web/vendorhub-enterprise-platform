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
      enum: ["Admin", "Manager", "Employee", "SYSTEM"],
      default: "Employee",
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      // We make it not required at the mongoose level temporarily to avoid breaking existing seeding/migrations if any run, but in practice it's required for normal users.
    },
    
    organizationRole: {
      type: String,
      enum: ["Owner", "Admin", "Manager", "Employee", "Viewer"],
    },

    tenantVersion: {
      type: Number,
      default: 1
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

userSchema.index({ organization: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;