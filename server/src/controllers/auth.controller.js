const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const registerUser = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.status(201).json(
    new ApiResponse(201, "User registered successfully", result)
  );
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.status(200).json(
    new ApiResponse(200, "User logged in successfully", result)
  );
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json(
    new ApiResponse(200, "User profile fetched successfully", user)
  );
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", user)
  );
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json(
    new ApiResponse(200, "Password changed successfully", result)
  );
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json(
    new ApiResponse(200, result.message, { resetToken: result.resetToken })
  );
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);

  res.status(200).json(
    new ApiResponse(200, result.message)
  );
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};