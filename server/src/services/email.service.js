const nodemailer = require('nodemailer');
const templates = require('../utils/emailTemplates/templates');

// Configure transporter
// In production, you would use a real SMTP service (SendGrid, SES, Mailgun, etc.)
// For development/testing without credentials, we use ethereal email (or similar stub) if real ones aren't provided.
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback for dev if no SMTP credentials exist
    console.log('[EMAIL] No SMTP config found, using JSON fallback transporter.');
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const t = await getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VendorHub" <noreply@vendorhub.local>',
      to,
      subject,
      html: htmlContent,
    };

    const info = await t.sendMail(mailOptions);
    
    // In dev stream transport mode, it returns a message object we can log
    if (info.message) {
      console.log(`[EMAIL MOCK] Sent to: ${to} | Subject: ${subject}`);
    } else {
      console.log(`[EMAIL] Sent to: ${to} | MessageId: ${info.messageId}`);
    }
    
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error.message);
    return false;
  }
};

/**
 * Higher-level functions to send specific business emails
 */
const sendWelcomeEmail = async (user) => {
  const html = templates.buildWelcomeEmail(user);
  return sendEmail(user.email, 'Welcome to VendorHub', html);
};

const sendPasswordResetEmail = async (user, token) => {
  const html = templates.buildPasswordResetEmail(user, token);
  return sendEmail(user.email, 'VendorHub Password Reset', html);
};

const sendRfqInvitationEmail = async (vendorUser, rfq) => {
  const html = templates.buildRfqInvitationEmail(
    vendorUser.firstName || vendorUser.fullName,
    rfq.rfqNumber,
    rfq.title,
    `/app/rfqs/${rfq._id}`
  );
  return sendEmail(vendorUser.email, `RFQ Invitation: ${rfq.rfqNumber}`, html);
};

const sendRfqAwardEmail = async (vendorUser, rfq) => {
  const html = templates.buildRfqAwardEmail(
    vendorUser.firstName || vendorUser.fullName,
    rfq.rfqNumber,
    rfq.title,
    `/app/rfqs/${rfq._id}`
  );
  return sendEmail(vendorUser.email, `Congratulations: Quotation Awarded for ${rfq.rfqNumber}`, html);
};

const sendPrApprovedEmail = async (user, pr) => {
  const html = templates.buildPrApprovedEmail(
    user.firstName || user.fullName,
    pr.requestNumber,
    pr.title,
    `/app/purchase-requests/${pr._id}`
  );
  return sendEmail(user.email, `Approved: PR-${pr.requestNumber}`, html);
};

const sendPrRejectedEmail = async (user, pr) => {
  const html = templates.buildPrRejectedEmail(
    user.firstName || user.fullName,
    pr.requestNumber,
    pr.title,
    `/app/purchase-requests/${pr._id}`
  );
  return sendEmail(user.email, `Rejected: PR-${pr.requestNumber}`, html);
};

const sendGenericEmail = async (user, title, message, url) => {
  const html = templates.buildGenericEmail(title, message, url);
  return sendEmail(user.email, title, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendRfqInvitationEmail,
  sendRfqAwardEmail,
  sendPrApprovedEmail,
  sendPrRejectedEmail,
  sendGenericEmail,
};
