import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),

  APP_NAME: z.string().min(1),
  APP_PORT: z.string().optional(),
  APP_BASE_URL: z.string().min(1),
  CORS_ORIGINS: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN_SECONDS: z.string().optional(),

  REFRESH_TOKEN_EXPIRES_DAYS: z.string().optional(),
  PASSWORD_RESET_EXPIRES_MINUTES: z.string().optional(),

  THROTTLE_TTL_SECONDS: z.string().optional(),
  THROTTLE_LIMIT: z.string().optional(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_SECURE: z.enum(['true', 'false']),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(8),
  MAIL_FROM: z.string().min(1),

  ACCOUNT_SETUP_EXPIRES_MINUTES: z.string().optional(),
  EMAIL_VERIFY_EXPIRES_MINUTES: z.string().optional(),

  SEED_ADMIN_EMAIL: z.string().optional(),
  SEED_ADMIN_PHONE: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional()
});

export const envValidation = (config: Record<string, unknown>) => {
  const result = schema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(message);
  }

  return result.data;
};
