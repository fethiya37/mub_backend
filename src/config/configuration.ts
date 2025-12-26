export const configuration = () => ({
  app: {
    name: process.env.APP_NAME,
    port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000,
    baseUrl: process.env.APP_BASE_URL,
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresInSeconds: process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ? Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) : 900
  },
  refreshToken: {
    expiresDays: process.env.REFRESH_TOKEN_EXPIRES_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) : 30
  },
  passwordReset: {
    expiresMinutes: process.env.PASSWORD_RESET_EXPIRES_MINUTES ? Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) : 20
  },
  throttle: {
    ttlSeconds: process.env.THROTTLE_TTL_SECONDS ? Number(process.env.THROTTLE_TTL_SECONDS) : 60,
    limit: process.env.THROTTLE_LIMIT ? Number(process.env.THROTTLE_LIMIT) : 20
  },
  mail: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM
  }
});
