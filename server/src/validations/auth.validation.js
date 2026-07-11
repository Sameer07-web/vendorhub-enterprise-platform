const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().required().trim().messages({
    "string.empty": "Full name is required"
  }),
  email: Joi.string().email().lowercase().required().trim().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address"
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long"
  }),
  role: Joi.string().valid("Admin", "Manager", "Employee").optional(),
  department: Joi.string().trim().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().trim().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address"
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required"
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
