const header = `
  <div style="background-color: #1E293B; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
    <h1 style="color: #ffffff; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 600;">
      VendorHub
    </h1>
  </div>
`;

const footer = `
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px;">
      &copy; ${new Date().getFullYear()} VendorHub Enterprise Platform. All rights reserved.
    </p>
    <p style="color: #94a3b8; margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </div>
`;

const button = (text, url) => `
  <div style="text-align: center; margin: 32px 0;">
    <a href="${url}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; display: inline-block;">
      ${text}
    </a>
  </div>
`;

const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VendorHub Notification</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body { background-color: #0f172a !important; color: #f8fafc !important; }
      .email-container { background-color: #1e293b !important; border: 1px solid #334155 !important; }
      .content-area { color: #cbd5e1 !important; }
      .content-area h2 { color: #f8fafc !important; }
      .footer { background-color: #0f172a !important; border-top-color: #334155 !important; }
    }
  </style>
</head>
<body style="background-color: #f1f5f9; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
    ${header}
    <div class="content-area" style="padding: 32px 24px;">
      ${content}
    </div>
    ${footer.replace('background-color: #f8fafc', 'background-color: #f8fafc" class="footer')}
  </div>
</body>
</html>
`;

module.exports = {
  header,
  footer,
  button,
  layout,
};
