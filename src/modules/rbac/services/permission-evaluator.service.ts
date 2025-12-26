import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';

@Injectable()
export class PermissionEvaluatorService {
  constructor(
    private readonly permissions: PermissionRepository,
    private readonly userRoles: UserRoleRepository
  ) {}

  async getUserRolesAndPermissions(userId: string): Promise<{ roles: string[]; permissions: string[] }> {
    const [roles, permissions] = await Promise.all([
      this.userRoles.listRolesByUserId(userId),
      this.permissions.listByUserId(userId)
    ]);
    return { roles, permissions };
  }
}
