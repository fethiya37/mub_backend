import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { RbacService } from './services/rbac.service';
import { PermissionEvaluatorService } from './services/permission-evaluator.service';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { RolePrismaRepository } from './prisma/role.prisma-repository';
import { PermissionPrismaRepository } from './prisma/permission.prisma-repository';
import { UserRolePrismaRepository } from './prisma/user-role.prisma-repository';
import { AdminRolesController } from './presentation/admin-roles.controller';
import { AdminPermissionsController } from './presentation/admin-permissions.controller';
import { AdminUserRolesController } from './presentation/admin-user-roles.controller';

@Module({
  imports: [UsersModule],
  controllers: [AdminRolesController, AdminPermissionsController, AdminUserRolesController],
  providers: [
    RbacService,
    PermissionEvaluatorService,
    { provide: RoleRepository, useClass: RolePrismaRepository },
    { provide: PermissionRepository, useClass: PermissionPrismaRepository },
    { provide: UserRoleRepository, useClass: UserRolePrismaRepository }
  ],
  exports: [RbacService, PermissionEvaluatorService]
})
export class RbacModule {}
