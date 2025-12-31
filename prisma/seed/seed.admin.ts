import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ROLES } from './permissions.catalog';

export async function seedAdmin(prisma: PrismaClient) {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@mub.local';
  const phone = process.env.SEED_ADMIN_PHONE ?? '+251900000000';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

  const superRole = await prisma.role.findUnique({ where: { name: ROLES.SUPERADMIN } });
  if (!superRole) throw new Error('SUPERADMIN role missing');

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { phone },
    update: { email, passwordHash, isActive: true },
    create: { email, phone, passwordHash, isActive: true, applicantVerified: true }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superRole.id } },
    update: {},
    create: { userId: user.id, roleId: superRole.id }
  });
}
