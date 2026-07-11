const Joi = require("joi");

const createVendorSchema = Joi.object({
  companyName: Joi.string().required().trim().messages({
    "string.empty": "Company Name is required",
  }),
  contactPerson: Joi.string().required().trim().messages({
    "string.empty": "Contact Person is required",
  }),
  email: Joi.string().email().lowercase().required().trim().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+\-()\s]+$/)
    .required()
    .trim()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be valid",
    }),
  website: Joi.string().uri().optional().trim().allow(""),
  gstNumber: Joi.string().uppercase().required().trim().messages({
    "string.empty": "GST Number is required",
  }),
  address: Joi.string().optional().trim().allow(""),
  city: Joi.string().optional().trim().allow(""),
  state: Joi.string().optional().trim().allow(""),
  country: Joi.string().optional().trim().allow(""),
  postalCode: Joi.string().optional().trim().allow(""),
  vendorCategory: Joi.string()
    .valid("Raw Material", "IT", "Office Supplies", "Logistics", "Maintenance", "Consulting")
    .required()
    .messages({
      "any.only": "Invalid vendor category",
      "string.empty": "Vendor Category is required",
    }),
  status: Joi.string().valid("Active", "Inactive", "Blocked").optional(),
});

const updateVendorSchema = Joi.object({
  companyName: Joi.string().trim().optional(),
  contactPerson: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional().messages({
    "string.email": "Must be a valid email address",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+\-()\s]+$/)
    .trim()
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be valid",
    }),
  website: Joi.string().uri().optional().trim().allow(""),
  gstNumber: Joi.string().uppercase().trim().optional(),
  address: Joi.string().optional().trim().allow(""),
  city: Joi.string().optional().trim().allow(""),
  state: Joi.string().optional().trim().allow(""),
  country: Joi.string().optional().trim().allow(""),
  postalCode: Joi.string().optional().trim().allow(""),
  vendorCategory: Joi.string()
    .valid("Raw Material", "IT", "Office Supplies", "Logistics", "Maintenance", "Consulting")
    .optional(),
  status: Joi.string().valid("Active", "Inactive", "Blocked").optional(),
  rating: Joi.number().min(0).max(5).optional(),
});

module.exports = {
  createVendorSchema,
  updateVendorSchema,
};
