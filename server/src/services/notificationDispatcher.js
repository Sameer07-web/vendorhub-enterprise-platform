const { emitNotification } = require("../socket/notificationGateway");
const emailService = require("./email.service");
const User = require("../models/User");

/**
 * The Delivery Dispatcher.
 * Takes a saved DB notification and routes it asynchronously to appropriate delivery channels.
 * 
 * Future expansion: SMS, Push notifications.
 */
const dispatchNotification = async (notificationRecord) => {
  // Fire and forget (do not await, to ensure API response is fast)
  processImmediateDispatch(notificationRecord).catch(err => {
    console.error('[DISPATCHER ERROR]', err);
  });
};

const processImmediateDispatch = async (notification) => {
  try {
    // 1. Fetch user to get email and preferences
    const user = await User.findById(notification.recipient).select("email firstName fullName notificationPreferences");
    if (!user) return;

    const prefs = user.notificationPreferences || {
      email: { enabled: true },
      inApp: { enabled: true },
      categories: {
        purchaseRequests: true,
        rfqs: true,
        vendors: true,
        quotations: true,
        system: true,
        broadcasts: true
      }
    };

    // 2. Evaluate Preferences (Category Check)
    let category = "system";
    if (notification.type.startsWith("PR_")) category = "purchaseRequests";
    else if (notification.type.startsWith("RFQ_")) category = "rfqs";
    else if (notification.type.startsWith("VENDOR_")) category = "vendors";
    else if (notification.type === "BROADCAST") category = "broadcasts";
    
    // Auth-related emails (Welcome, Password Reset) are exempt from category/channel opt-out.
    const isExempt = ["WELCOME", "PASSWORD_RESET"].includes(notification.type);

    if (!isExempt && prefs.categories && prefs.categories[category] === false) {
      // User opted out of this category entirely.
      return;
    }

    // 3. Choose Channels & Deliver

    // Socket.IO Channel
    if (isExempt || prefs.inApp.enabled) {
      emitNotification(notification.recipient, notification);
    }

    // Email Channel
    if ((isExempt || prefs.email.enabled) && user.email) {
    // This maps the generic notification back into specific email templates.
    switch (notification.type) {
      case "WELCOME":
        await emailService.sendWelcomeEmail(user);
        break;
      
      case "PASSWORD_RESET":
        // Usually handled directly during the auth flow, but if we fired a notification for it:
        // metadata should contain the token
        if (notification.metadata?.resetToken) {
          await emailService.sendPasswordResetEmail(user, notification.metadata.resetToken);
        }
        break;
        
      case "RFQ_INVITED":
        if (notification.metadata?.rfqNumber && notification.metadata?.title) {
          await emailService.sendRfqInvitationEmail(user, {
            _id: notification.entityId,
            rfqNumber: notification.metadata.rfqNumber,
            title: notification.metadata.title
          });
        }
        break;

      case "RFQ_AWARDED":
        if (notification.metadata?.rfqNumber && notification.metadata?.title) {
          await emailService.sendRfqAwardEmail(user, {
            _id: notification.entityId,
            rfqNumber: notification.metadata.rfqNumber,
            title: notification.metadata.title
          });
        }
        break;

      case "PR_APPROVED":
        if (notification.metadata?.prNumber && notification.metadata?.title) {
          await emailService.sendPrApprovedEmail(user, {
            _id: notification.entityId,
            requestNumber: notification.metadata.prNumber,
            title: notification.metadata.title
          });
        }
        break;

      case "PR_REJECTED":
        if (notification.metadata?.prNumber && notification.metadata?.title) {
          await emailService.sendPrRejectedEmail(user, {
            _id: notification.entityId,
            requestNumber: notification.metadata.prNumber,
            title: notification.metadata.title
          });
        }
        break;
      
      default:
        // For other notification types, we might just send a generic email 
        // if priority is HIGH or CRITICAL.
        if (notification.priority === "HIGH" || notification.priority === "CRITICAL") {
          await emailService.sendGenericEmail(user, notification.title, notification.message, notification.actionUrl);
        }
        break;
    }
    }
  } catch (error) {
    console.error('[DISPATCHER ERROR] Failed to dispatch channels:', error);
  }
};

module.exports = {
  dispatchNotification,
};
