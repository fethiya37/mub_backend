import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ActiveUserGuard } from './common/guards/active-user.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

export const appGuards = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: ActiveUserGuard },
  { provide: APP_GUARD, useClass: PermissionsGuard }
];
