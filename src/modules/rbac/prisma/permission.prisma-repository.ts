import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionPrismaRepository extends PermissionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async list() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' }, select: { id: true, code: true, description: true } });
  }

  async listByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.rolePermission.findMany({
      where: { role: { userRoles: { some: { userId } } } },
      select: { permission: { select: { code: true } } }
    });
    return Array.from(new Set(rows.map((r) => r.permission.code)));
  }
}
