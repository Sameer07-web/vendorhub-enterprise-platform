const express = require("express");
const notificationController = require("../controllers/notification.controller");
const notificationValidation = require("../validations/notification.validation");
const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.route("/")
  .get(validate(notificationValidation.getNotifications), notificationController.getNotifications);

router.route("/broadcast")
  .post(authorize("Admin"), validate(notificationValidation.broadcastSchema), notificationController.createBroadcast);

router.route("/unread")
  .get(notificationController.getUnreadCount);

router.route("/read-all")
  .patch(notificationController.markAllAsRead);

router.route("/clear-read")
  .delete(notificationController.clearRead);

router.route("/:id")
  .delete(validate(notificationValidation.deleteNotification), notificationController.deleteNotification);

router.route("/:id/read")
  .patch(validate(notificationValidation.markAsRead), notificationController.markAsRead);

module.exports = router;
