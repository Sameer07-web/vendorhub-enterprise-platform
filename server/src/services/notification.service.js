const Notification = require("../models/Notification");
const { dispatchNotification } = require("./notificationDispatcher");

/**
 * Generic factory method to create a notification
 * @param {Object} payload 
 * @param {string} payload.recipient - ObjectId of the recipient
 * @param {string} [payload.sender] - ObjectId of the sender
 * @param {string} payload.type - Type of notification (e.g., 'PR_APPROVED')
 * @param {string} payload.title - Short title
 * @param {string} payload.message - Detailed message
 * @param {string} [payload.entityType] - Type of related entity (e.g., 'PurchaseRequest')
 * @param {string} [payload.entityId] - ObjectId of related entity
 * @param {string} [payload.priority] - Priority (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} [payload.actionUrl] - Direct URL to the entity in frontend
 * @param {string} [payload.icon] - Icon name
 * @param {Object} [payload.metadata] - Extra flexible data
 * @param {Date} [payload.expiresAt] - Expiration date
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (payload) => {
  const notification = await Notification.create(payload);
  
  // Asynchronously dispatch to all channels (Socket, Email, etc.)
  dispatchNotification(notification);

  return notification;
};

/**
 * Get notifications for a specific user with pagination and filtering
 * @param {string} userId 
 * @param {Object} filters 
 * @param {Object} options 
 * @returns {Promise<Object>} { notifications, totalPages, totalResults, page, limit, unreadCount }
 */
const getUserNotifications = async (userId, filters = {}, options = { page: 1, limit: 20 }) => {
  const query = { recipient: userId, ...filters };
  
  const skip = (options.page - 1) * options.limit;
  
  const [notifications, totalResults, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .populate("sender", "firstName lastName email")
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);
  
  const totalPages = Math.ceil(totalResults / options.limit);
  
  return {
    notifications,
    totalPages,
    totalResults,
    page: options.page,
    limit: options.limit,
    unreadCount
  };
};

/**
 * Get only the unread count for a user
 * @param {string} userId 
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, isRead: false });
};

/**
 * Mark a single notification as read
 * @param {string} notificationId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true, runValidators: true }
  );
  return notification;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId 
 * @returns {Promise<number>} number of modified documents
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount;
};

/**
 * Delete a single notification
 * @param {string} notificationId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  return notification;
};

/**
 * Clear all read notifications for a user
 * @param {string} userId 
 * @returns {Promise<number>} number of deleted documents
 */
const clearReadNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId, isRead: true });
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
