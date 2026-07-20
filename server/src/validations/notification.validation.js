const Joi = require("joi");

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean(),
    type: Joi.string().valid(
      "RFQ_INVITED",
      "RFQ_AWARDED",
      "PR_APPROVED",
      "PR_REJECTED",
      "PR_SUBMITTED",
      "VENDOR_CREATED",
      "VENDOR_UPDATED",
      "SYSTEM",
      "PASSWORD_RESET",
      "WELCOME"
    ),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL"),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
};

const deleteNotification = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
});

const broadcastSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").default("MEDIUM"),
  targetAudience: Joi.string().valid("All", "Managers", "Employees").required(),
  expiresAt: Joi.date().iso().optional(),
  actionUrl: Joi.string().uri({ allowRelative: true }).optional(),
});

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  broadcastSchema,
};
