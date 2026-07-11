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

module.exports = {
  registerUser,
  loginUser,
};