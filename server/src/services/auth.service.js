const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const notificationService = require("./notification.service");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user — role is forced to "Employee" to prevent privilege escalation
 */
const registerUser = async (userData) => {
  const { fullName, email, password, department } = userData;

  // Check duplicate email
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, "Email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user — always default role, never from payload
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: "Employee",
    department,
  });

  // Generate JWT so user is logged in immediately after registration
  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  await notificationService.createNotification({
    recipient: user._id,
    type: "WELCOME",
    title: "Welcome to VendorHub",
    message: "Your enterprise account has been created successfully.",
    priority: "MEDIUM",
    entityType: "User",
    entityId: user._id,
    actionUrl: "/app/dashboard",
    icon: "Shield",
  });

  return {
    user: userResponse,
    token,
  };
};

/**
 * Login user
 */
const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Check if user exists and fetch password explicitly
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact an administrator.");
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate JWT token
  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token,
  };
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

/**
 * Update user profile (fullName, department)
 */
const updateProfile = async (userId, updateData) => {
  const allowedFields = ["fullName", "department"];
  const sanitized = {};
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

/**
 * Change password (requires current password verification)
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash and save new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: "Password updated successfully" };
};

/**
 * Forgot password — generates reset token (returned in response for dev/demo, would be emailed in production)
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return { message: "If an account with that email exists, a reset link has been sent." };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  console.log(`[LOG] Password reset token generated for user: ${user.email} at ${new Date().toISOString()}`);

  return {
    message: "If an account with that email exists, a reset link has been sent.",
    // In production, this would be sent via email, not returned in response
    resetToken,
  };
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Hash and save new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save({ validateBeforeSave: false });

  console.log(`[LOG] Password reset completed for user: ${user.email} at ${new Date().toISOString()}`);

  await notificationService.createNotification({
    recipient: user._id,
    type: "PASSWORD_RESET",
    title: "Password Reset Successful",
    message: "Your password has been reset successfully. If you did not perform this action, please contact support immediately.",
    priority: "HIGH",
    entityType: "User",
    entityId: user._id,
  });

  return { message: "Password has been reset successfully" };
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};