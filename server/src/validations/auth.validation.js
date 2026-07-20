const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().required().trim().messages({
    "string.empty": "Full name is required"
  }),
  email: Joi.string().email().lowercase().required().trim().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address"
  }),
  password: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }),
  department: Joi.string().trim().optional()
  // Note: role is intentionally NOT included — always defaults to Employee
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

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().optional(),
  department: Joi.string().trim().optional().allow("", null)
}).options({ stripUnknown: true, abortEarly: false });

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required"
  }),
  newPassword: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters long",
      "string.pattern.base": "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match"
  })
}).options({ stripUnknown: true, abortEarly: false });

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required().trim().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address"
  })
}).options({ stripUnknown: true, abortEarly: false });

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Reset token is required"
  }),
  newPassword: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters long",
      "string.pattern.base": "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    })
}).options({ stripUnknown: true, abortEarly: false });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
