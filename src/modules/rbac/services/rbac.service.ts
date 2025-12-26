import { Injectable } from '@nestjs/common';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class RbacService {
  constructor(
    private readonly userRoles: UserRoleRepository,
    private readonly roles: RoleRepository
  ) {}

  async listRoles() {
    return this.roles.list();
  }

  async replaceUserRoles(userId: string, roleNames: string[]) {
    await this.userRoles.replaceRoles(userId, roleNames);
  }
}
