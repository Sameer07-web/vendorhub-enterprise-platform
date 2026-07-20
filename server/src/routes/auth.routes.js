const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected routes (require JWT)
router.get("/me", protect, getMe);
router.patch("/profile", protect, validate(updateProfileSchema), updateProfile);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);

module.exports = router;