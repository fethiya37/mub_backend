export function getNotificationTemplate(
  appName: string,
  name: string,
  title: string,
  message: string,
  type: string,
): string {
  const getTypeColor = () => {
    if (type.includes('APPLICANT')) return '#2196F3';
    if (type.includes('EMPLOYER')) return '#4CAF50';
    if (type.includes('VISA')) return '#FF9800';
    return '#9C27B0';
  };

  const getGradient = () => {
    if (type.includes('APPLICANT'))
      return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
    if (type.includes('EMPLOYER'))
      return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
    if (type.includes('VISA'))
      return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    return 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)';
  };

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
          background: ${getGradient()};
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
        .notification-type {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 20px;
          background-color: ${getTypeColor()}15;
          color: ${getTypeColor()};
          border: 1px solid ${getTypeColor()}30;
        }
        .title {
          font-size: 22px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 16px;
        }
        .message-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid ${getTypeColor()};
          margin: 20px 0;
        }
        .message {
          color: #4b5563;
          font-size: 15px;
          margin: 0;
          line-height: 1.6;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding: 18px 26px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          background: #fafafa;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .title {
            font-size: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${appName}</h1>
        </div>
        <div class="content">
          <div class="notification-type">${type}</div>
          <div class="title">${title}</div>
          <div class="message-box">
            <p class="message">${message}</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
