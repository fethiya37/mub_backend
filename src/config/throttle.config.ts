import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig = (): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl: process.env.THROTTLE_TTL_SECONDS ? Number(process.env.THROTTLE_TTL_SECONDS) : 60,
      limit: process.env.THROTTLE_LIMIT ? Number(process.env.THROTTLE_LIMIT) : 20
    }
  ]
});
