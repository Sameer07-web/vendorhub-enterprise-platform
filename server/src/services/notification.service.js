const NotificationRepository = require("../repositories/NotificationRepository");
const { getIo } = require("../socket/socketServer");

/**
 * Create a new notification
 */
const createNotification = async (sessionOrOrgId, notificationData) => {
  const notification = await NotificationRepository.create(sessionOrOrgId, notificationData);

  try {
    const io = getIo();
    if (io) {
      io.to(notification.recipient.toString()).emit("newNotification", notification);
    }
  } catch (error) {
    console.warn("[LOG] Real-time notification not sent:", error.message);
  }

  return notification;
};

/**
 * Get notifications for a specific user with pagination and filtering
 */
const getUserNotifications = async (sessionOrOrgId, userId, filters = {}, options = { page: 1, limit: 20 }) => {
  const query = { recipient: userId, ...filters };
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [notifications, totalResults, unreadCount] = await Promise.all([
    NotificationRepository.findMany(sessionOrOrgId, query, null, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: [{ path: "sender", select: "firstName lastName email" }]
    }),
    NotificationRepository.count(sessionOrOrgId, query),
    NotificationRepository.count(sessionOrOrgId, { recipient: userId, isRead: false })
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  return {
    notifications,
    totalPages,
    totalResults,
    page,
    limit,
    unreadCount
  };
};

/**
 * Get only the unread count for a user
 */
const getUnreadCount = async (sessionOrOrgId, userId) => {
  return await NotificationRepository.count(sessionOrOrgId, { recipient: userId, isRead: false });
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (sessionOrOrgId, notificationId, userId) => {
  return await NotificationRepository.update(
    sessionOrOrgId,
    notificationId,
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (sessionOrOrgId, userId) => {
  const orgId = sessionOrOrgId.organization ? sessionOrOrgId.organization : sessionOrOrgId._id ? sessionOrOrgId._id : sessionOrOrgId;
  const result = await NotificationRepository.tenantRepo.updateMany(
    orgId,
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount;
};

/**
 * Delete a single notification
 */
const deleteNotification = async (sessionOrOrgId, notificationId, userId) => {
  return await NotificationRepository.delete(sessionOrOrgId, notificationId);
};

/**
 * Clear all read notifications for a user
 */
const clearReadNotifications = async (sessionOrOrgId, userId) => {
  const orgId = sessionOrOrgId.organization ? sessionOrOrgId.organization : sessionOrOrgId._id ? sessionOrOrgId._id : sessionOrOrgId;
  const result = await NotificationRepository.tenantRepo.deleteMany(orgId, { recipient: userId, isRead: true });
  return result.deletedCount;
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};
