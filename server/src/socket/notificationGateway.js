const { getIo } = require("./socketServer");

/**
 * Emit a new notification to a specific user
 * @param {string} userId - Recipient ID
 * @param {Object} notificationData - The notification payload
 */
const emitNotification = (userId, notificationData) => {
  try {
    const io = getIo();
    // Emit to the user's specific room
    io.to(`user:${userId.toString()}`).emit("new_notification", notificationData);
  } catch (error) {
    console.error(`[SOCKET ERROR] Failed to emit notification to ${userId}:`, error.message);
  }
};

/**
 * Emit a broadcast to multiple users by role
 * @param {Array<string>} roles - Roles to broadcast to
 * @param {Object} notificationData
 */
const emitBroadcast = (roles, notificationData) => {
  // In a more complex setup, users could join role-based rooms.
  // For now, this is a placeholder for Milestone 6.4
};

module.exports = {
  emitNotification,
  emitBroadcast,
};
