const Joi = require("joi");

const createRFQSchema = Joi.object({
  purchaseRequest: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid Purchase Request ID",
    "string.hex": "Invalid Purchase Request ID format"
  }),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow("", null),
  vendors: Joi.array().items(
    Joi.string().hex().length(24)
  ).min(1).max(10).required().messages({
    "array.min": "At least one vendor must be selected",
    "array.max": "Maximum of 10 vendors allowed"
  }),
  quotationDeadline: Joi.date().greater('now').required().messages({
    "date.greater": "Quotation Deadline must be in the future"
  })
}).options({ stripUnknown: true, abortEarly: false });

const updateRFQSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim().allow("", null),
  vendors: Joi.array().items(
    Joi.string().hex().length(24)
  ).min(1).max(10).messages({
    "array.min": "At least one vendor must be selected",
    "array.max": "Maximum of 10 vendors allowed"
  }),
  quotationDeadline: Joi.date().greater('now').messages({
    "date.greater": "Quotation Deadline must be in the future"
  })
}).options({ stripUnknown: true, abortEarly: false });

// For explicitly sending RFQ, maybe no body is needed, but we provide empty schema for consistency if any options arrive later
const sendRFQSchema = Joi.object({}).options({ stripUnknown: true, abortEarly: false });

const closeRFQSchema = Joi.object({}).options({ stripUnknown: true, abortEarly: false });

const cancelRFQSchema = Joi.object({}).options({ stripUnknown: true, abortEarly: false });

module.exports = {
  createRFQSchema,
  updateRFQSchema,
  sendRFQSchema,
  closeRFQSchema,
  cancelRFQSchema
};
