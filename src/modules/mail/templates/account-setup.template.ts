export function getAccountSetupTemplate(appName: string, receiverName: string, setupUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 34px 20px;
          text-align: center;
        }
        .header h1 {
          color: #fff;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 28px 26px;
        }
        .btn {
          display: inline-block;
          padding: 14px 22px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
        }
        .link-box {
          background: #f8fafc;
          padding: 14px;
          border-radius: 8px;
          word-break: break-all;
          color: #1d4ed8;
          font-size: 13px;
          margin-top: 14px;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding: 18px 26px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete your ${appName} account setup</h1>
        </div>
        <div class="content">
          <p>Hello ${receiverName},</p>
          <p>Your account is ready. Please complete your account setup by creating your password using the link below:</p>
          <p style="text-align:center;margin:22px 0;">
            <a class="btn" href="${setupUrl}">Complete Account Setup</a>
          </p>
          <p>If the button doesn’t work, copy and paste this link into your browser:</p>
          <div class="link-box">${setupUrl}</div>
          <p>This link is time-limited and can be used only once.</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}
