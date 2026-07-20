const { layout, button } = require("./partials");

const getBaseUrl = () => process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0] : 'http://localhost:5173';

const buildWelcomeEmail = (user) => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to VendorHub, ${user.firstName}!</h2>
    <p>Your account has been successfully created. You can now log in to the platform and access your dashboard.</p>
    ${button('Sign In to Dashboard', `${getBaseUrl()}/login`)}
  `;
  return layout(content);
};

const buildPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${getBaseUrl()}/reset-password/${resetToken}`;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
    <p>Hello ${user.firstName},</p>
    <p>We received a request to reset your password for your VendorHub account. Click the button below to choose a new password.</p>
    ${button('Reset Password', resetUrl)}
    <p style="font-size: 14px; color: #64748b; margin-top: 24px;">If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
  `;
  return layout(content);
};

const buildRfqInvitationEmail = (vendorName, rfqNumber, title, url) => {
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">New RFQ Invitation</h2>
    <p>Hello ${vendorName},</p>
    <p>You have been invited to participate in a new Request for Quotation (RFQ).</p>
    <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <p style="margin: 0;"><strong>RFQ Number:</strong> ${rfqNumber}</p>
      <p style="margin: 8px 0 0 0;"><strong>Title:</strong> ${title}</p>
    </div>
    <p>Please review the RFQ details and submit your quotation before the deadline.</p>
    ${button('View RFQ', fullUrl)}
  `;
  return layout(content);
};

const buildRfqAwardEmail = (vendorName, rfqNumber, title, url) => {
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Quotation Awarded!</h2>
    <p>Hello ${vendorName},</p>
    <p>Congratulations! Your quotation for the following RFQ has been awarded.</p>
    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0; color: #166534;"><strong>RFQ Number:</strong> ${rfqNumber}</p>
      <p style="margin: 8px 0 0 0; color: #166534;"><strong>Title:</strong> ${title}</p>
    </div>
    <p>Our procurement team will contact you shortly with the purchase order details.</p>
    ${button('View Details', fullUrl)}
  `;
  return layout(content);
};

const buildPrApprovedEmail = (requesterName, prNumber, title, url) => {
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Purchase Request Approved</h2>
    <p>Hello ${requesterName},</p>
    <p>Great news! Your purchase request has been fully approved by management.</p>
    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0; color: #166534;"><strong>PR Number:</strong> ${prNumber}</p>
      <p style="margin: 8px 0 0 0; color: #166534;"><strong>Title:</strong> ${title}</p>
    </div>
    <p>The request will now proceed to the sourcing and procurement stage.</p>
    ${button('View Request', fullUrl)}
  `;
  return layout(content);
};

const buildPrRejectedEmail = (requesterName, prNumber, title, url) => {
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Purchase Request Rejected</h2>
    <p>Hello ${requesterName},</p>
    <p>Your purchase request has unfortunately been rejected.</p>
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca;">
      <p style="margin: 0; color: #991b1b;"><strong>PR Number:</strong> ${prNumber}</p>
      <p style="margin: 8px 0 0 0; color: #991b1b;"><strong>Title:</strong> ${title}</p>
    </div>
    <p>Please review the comments from the approver on the platform. You may be able to update and resubmit the request.</p>
    ${button('View Comments', fullUrl)}
  `;
  return layout(content);
};

const buildGenericEmail = (title, message, url) => {
  const fullUrl = url && !url.startsWith('http') ? `${getBaseUrl()}${url}` : url;
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">${title}</h2>
    <p>${message}</p>
    ${url ? button('View Details', fullUrl) : ''}
  `;
  return layout(content);
};

module.exports = {
  buildWelcomeEmail,
  buildPasswordResetEmail,
  buildRfqInvitationEmail,
  buildRfqAwardEmail,
  buildPrApprovedEmail,
  buildPrRejectedEmail,
  buildGenericEmail,
};
