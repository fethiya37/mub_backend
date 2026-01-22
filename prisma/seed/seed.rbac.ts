import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from './permissions.catalog';

export async function seedRbac(prisma: PrismaClient) {
  const roles = Object.values(ROLES);

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code }
    });
  }

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    const codesList = Array.from(codes) as string[];

    const permissions = await prisma.permission.findMany({
      where: { code: { in: codesList } }
    });

    for (const p of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id }
      });
    }
  }
}
