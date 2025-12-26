import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserRoleRepository } from '../repositories/user-role.repository';

@Injectable()
export class UserRolePrismaRepository extends UserRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listRolesByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      select: { role: { select: { name: true } } }
    });
    return rows.map((r) => r.role.name);
  }

  async replaceRoles(userId: string, roleNames: string[]): Promise<void> {
    const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } }, select: { id: true } });
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roles.map((r) => ({ userId, roleId: r.id })),
        skipDuplicates: true
      })
    ]);
  }
}
