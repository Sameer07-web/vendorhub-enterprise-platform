const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (userData) => {
  const { fullName, email, password, role, department } = userData;

  // Check duplicate email
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, "Email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    department
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
  };
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Check if user exists and fetch password explicitly
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
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

module.exports = {
  registerUser,
  loginUser
};