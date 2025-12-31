export function getPasswordResetTemplate(appName: string, resetUrl: string, receiverName?: string): string {
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
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
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
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
        }
        .link-box {
          background: #fff7ed;
          padding: 14px;
          border-radius: 8px;
          word-break: break-all;
          color: #9a3412;
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
          <h1>${appName} password reset</h1>
        </div>
        <div class="content">
          <p>Hello${receiverName ? ` ${receiverName}` : ''},</p>
          <p>We received a request to reset your password. Use the link below:</p>
          <p style="text-align:center;margin:22px 0;">
            <a class="btn" href="${resetUrl}">Reset Password</a>
          </p>
          <p>If the button doesn’t work, copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>
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
