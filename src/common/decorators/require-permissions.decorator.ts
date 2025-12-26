import { SetMetadata } from '@nestjs/common';
import { RBAC } from '../constants/rbac.constants';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(RBAC.PERMISSIONS_KEY, permissions);
