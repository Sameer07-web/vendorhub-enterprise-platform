const Joi = require("joi");

const createPurchaseRequestSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  department: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  vendor: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid vendor ID",
    "string.hex": "Invalid vendor ID format"
  }),
  quantity: Joi.number().min(1).required(),
  estimatedCost: Joi.number().greater(0).required(),
  currency: Joi.string().default("USD"),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").required(),
  requiredDate: Joi.date().greater('now').required().messages({
    "date.greater": "Required date must be in the future"
  })
}).options({ stripUnknown: true, abortEarly: false });

const updatePurchaseRequestSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  department: Joi.string().trim(),
  category: Joi.string().trim(),
  vendor: Joi.string().hex().length(24).messages({
    "string.length": "Invalid vendor ID",
    "string.hex": "Invalid vendor ID format"
  }),
  quantity: Joi.number().min(1),
  estimatedCost: Joi.number().greater(0),
  currency: Joi.string(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL"),
  requiredDate: Joi.date().greater('now').messages({
    "date.greater": "Required date must be in the future"
  })
}).options({ stripUnknown: true, abortEarly: false });

const approvalSchema = Joi.object({
  managerComments: Joi.string().trim().allow("", null)
}).options({ stripUnknown: true, abortEarly: false });

module.exports = {
  createPurchaseRequestSchema,
  updatePurchaseRequestSchema,
  approvalSchema
};
