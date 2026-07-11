const Joi = require('joi');

const createQuotationSchema = {
  body: Joi.object().keys({
    rfq: Joi.string().required(),
    vendor: Joi.string().required(),
    currency: Joi.string().default('USD'),
    subtotal: Joi.number().min(0).required(),
    taxAmount: Joi.number().min(0).default(0),
    discount: Joi.number().min(0).default(0),
    shippingCost: Joi.number().min(0).default(0),
    deliveryDays: Joi.number().min(0).optional(),
    paymentTerms: Joi.string().trim().optional(),
    validUntil: Joi.date().iso().min(Joi.ref('$quotationDate')).optional(),
  }).unknown(false)
};

const updateQuotationSchema = {
  params: Joi.object().keys({
    id: Joi.string().required()
  }),
  body: Joi.object().keys({
    currency: Joi.string().optional(),
    subtotal: Joi.number().min(0).optional(),
    taxAmount: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    deliveryDays: Joi.number().min(0).optional(),
    paymentTerms: Joi.string().trim().optional(),
    validUntil: Joi.date().iso().min(Joi.ref('$quotationDate')).optional()
  }).unknown(false)
};

const reviewQuotationSchema = {
  params: Joi.object().keys({
    id: Joi.string().required()
  }),
  body: Joi.object().keys({
    reviewComments: Joi.string().trim().required(),
    comparisonScore: Joi.number().min(0).max(100).optional()
  }).unknown(false)
};

const selectWinnerSchema = {
  params: Joi.object().keys({
    id: Joi.string().required()
  }),
  body: Joi.object().keys({
    justification: Joi.string().trim().required()
  }).unknown(false)
};

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
  reviewQuotationSchema,
  selectWinnerSchema
};
