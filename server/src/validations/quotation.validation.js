const Joi = require('joi');

const createQuotationSchema = Joi.object({
  rfq: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid RFQ ID",
    "string.hex": "Invalid RFQ ID format"
  }),
  vendor: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid Vendor ID",
    "string.hex": "Invalid Vendor ID format"
  }),
  currency: Joi.string().default('USD'),
  subtotal: Joi.number().min(0).required(),
  taxAmount: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  shippingCost: Joi.number().min(0).default(0),
  deliveryDays: Joi.number().min(0).optional(),
  paymentTerms: Joi.string().trim().optional().allow("", null),
  validUntil: Joi.date().iso().optional()
}).options({ stripUnknown: true, abortEarly: false });

const updateQuotationSchema = Joi.object({
  currency: Joi.string().optional(),
  subtotal: Joi.number().min(0).optional(),
  taxAmount: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  shippingCost: Joi.number().min(0).optional(),
  deliveryDays: Joi.number().min(0).optional(),
  paymentTerms: Joi.string().trim().optional().allow("", null),
  validUntil: Joi.date().iso().optional()
}).options({ stripUnknown: true, abortEarly: false });

const reviewQuotationSchema = Joi.object({
  reviewComments: Joi.string().trim().required().messages({
    "string.empty": "Review comments are required"
  }),
  comparisonScore: Joi.number().min(0).max(100).optional()
}).options({ stripUnknown: true, abortEarly: false });

const selectWinnerSchema = Joi.object({
  justification: Joi.string().trim().optional().allow("", null)
}).options({ stripUnknown: true, abortEarly: false });

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
  reviewQuotationSchema,
  selectWinnerSchema
};
