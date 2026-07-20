const notificationService = require("../services/notification.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { dispatchNotification } = require("../services/notificationDispatcher");
const { logEvent } = require("../services/audit.service");

// Simple in-memory rate limiting for broadcasts (10 per hour per admin)
const broadcastRateLimit = new Map();

/**
 * Get all notifications for the logged-in user
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page, limit, isRead, priority, search, category, dateFilter } = req.query;
  
  const filters = {};
  if (isRead !== undefined) filters.isRead = isRead === 'true';
  if (priority) filters.priority = priority;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filters.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { message: { $regex: escaped, $options: 'i' } }
    ];
  }

  if (category) {
    if (category === 'purchaseRequests') filters.type = { $regex: /^PR_/ };
    else if (category === 'rfqs') filters.type = { $regex: /^RFQ_/ };
    else if (category === 'vendors') filters.type = { $regex: /^VENDOR_/ };
    else if (category === 'broadcasts') filters.type = 'BROADCAST';
    else if (category === 'system') filters.type = { $in: ['SYSTEM', 'WELCOME', 'PASSWORD_RESET'] };
  }

  if (dateFilter) {
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0,0,0,0));
      filters.createdAt = { $gte: startOfDay };
    } else if (dateFilter === 'thisWeek') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0,0,0,0);
      filters.createdAt = { $gte: startOfWeek };
    }
  }

  const result = await notificationService.getUserNotifications(
    req.user._id,
    filters,
    { page: parseInt(page, 10), limit: parseInt(limit, 10) }
  );

  res.status(200).json(new ApiResponse(200, "Notifications retrieved successfully", result));
});

/**
 * Get unread notification count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(200, "Unread count retrieved", { count }));
});

/**
 * Mark a specific notification as read
 */
const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  
  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  res.status(200).json(new ApiResponse(200, "Notification marked as read", notification));
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const modifiedCount = await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, "All notifications marked as read", { modifiedCount }));
});

/**
 * Delete a specific notification
 */
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id, req.user._id);
  
  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  res.status(200).json(new ApiResponse(200, "Notification deleted successfully"));
});

/**
 * Clear all read notifications
 */
const clearRead = catchAsync(async (req, res) => {
  const deletedCount = await notificationService.clearReadNotifications(req.user._id);
  res.status(200).json(new ApiResponse(200, "Read notifications cleared", { deletedCount }));
});

/**
 * @desc    Send a Broadcast Notification
 * @route   POST /api/v1/notifications/broadcast
 * @access  Private (Admin)
 */
const createBroadcast = catchAsync(async (req, res) => {
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Only administrators can send broadcasts");
  }

  // Rate Limiting Check
  const now = Date.now();
  const hour = 1000 * 60 * 60;
  const adminId = req.user._id.toString();
  const adminHistory = broadcastRateLimit.get(adminId) || [];
  
  // Clean up old timestamps
  const recentBroadcasts = adminHistory.filter(timestamp => now - timestamp < hour);
  
  if (recentBroadcasts.length >= 10) {
    throw new ApiError(429, "Broadcast rate limit exceeded. Maximum 10 broadcasts per hour allowed.");
  }

  recentBroadcasts.push(now);
  broadcastRateLimit.set(adminId, recentBroadcasts);

  const { title, message, priority, targetAudience, expiresAt, actionUrl } = req.body;

  // Find target users
  const userQuery = { isActive: true };
  if (targetAudience === "Managers") {
    userQuery.role = "Manager";
  } else if (targetAudience === "Employees") {
    userQuery.role = "Employee";
  }
  
  const targetUsers = await User.find(userQuery).select("_id");
  if (!targetUsers.length) {
    throw new ApiError(404, "No matching users found for the target audience");
  }

  // Prepare Notification Documents
  const notificationsToInsert = targetUsers.map(user => ({
    title,
    message,
    type: "BROADCAST",
    priority: priority || "MEDIUM",
    recipient: user._id,
    sender: req.user._id,
    actionUrl,
    expiresAt,
    metadata: {
      targetAudience
    }
  }));

  // DB persistence first
  const insertedDocs = await Notification.insertMany(notificationsToInsert);

  // Delivery routing second
  insertedDocs.forEach(doc => {
    dispatchNotification(doc).catch(err => console.error("Broadcast dispatch error:", err));
  });

  // Audit Logging
  await logEvent({
    userId: req.user._id,
    action: "BROADCAST",
    entityType: "System",
    entityId: req.user._id,
    newValue: {
      title,
      targetAudience,
      priority,
      recipientCount: insertedDocs.length
    }
  });

  res.status(201).json(
    new ApiResponse(201, `Broadcast successfully sent to ${insertedDocs.length} users`)
  );
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead,
  createBroadcast,
};
