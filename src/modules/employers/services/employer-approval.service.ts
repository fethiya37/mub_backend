import { BadRequestException, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class EmployerApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly auth: AuthService
  ) {}

  private buildEmployerUserFullName(employer: any) {
    const org = String(employer.organizationName ?? '').trim();
    const owner = String(employer.ownerName ?? '').trim();
    if (org && owner) return `${org} - ${owner}`;
    if (org) return org;
    if (owner) return owner;
    return 'Employer';
  }

  async approve(employerId: string, adminId: string, reason?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const employer = await tx.employer.findUnique({ where: { id: employerId } });
      if (!employer) throw new BadRequestException('Employer not found');
      if (employer.status !== 'PENDING') throw new BadRequestException('Only PENDING can be approved');
      if (employer.userId) throw new BadRequestException('Employer user already exists');

      if (!employer.contactEmail) throw new BadRequestException('Employer contact email missing');
      if (!employer.contactPhone) throw new BadRequestException('Employer contact phone missing');

      const existingByPhone = await tx.user.findUnique({ where: { phone: employer.contactPhone } });
      if (existingByPhone) throw new BadRequestException('User already exists with this phone');

      const existingByEmail = await tx.user.findUnique({ where: { email: employer.contactEmail } });
      if (existingByEmail) throw new BadRequestException('User already exists with this email');

      const role = await tx.role.findUnique({ where: { name: 'PARTNER_EMPLOYER' } });
      if (!role) throw new BadRequestException('PARTNER_EMPLOYER role missing');

      const unusablePasswordHash = crypto.randomBytes(48).toString('base64url');
      const fullName = this.buildEmployerUserFullName(employer);

      const user = await tx.user.create({
        data: {
          phone: employer.contactPhone,
          email: employer.contactEmail,
          passwordHash: unusablePasswordHash,
          isActive: true,
          applicantVerified: false,
          status: 'APPROVED',
          fullName
        }
      });

      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

      const updatedEmployer = await tx.employer.update({
        where: { id: employerId },
        data: { status: 'APPROVED', userId: user.id }
      });

      await tx.employerApprovalLog.create({
        data: {
          employerId,
          action: 'APPROVED',
          reason: reason ?? null,
          actionBy: adminId
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } }
      });

      return { userId: user.id, email: user.email, orgName: employer.organizationName, employer: updatedEmployer };
    });

    if (result.email) {
      await this.auth.sendAccountSetupEmail(result.userId, result.email, result.orgName);
    }

    await this.audit.log({
      performedBy: adminId,
      action: 'EMPLOYER_APPROVED',
      entityType: 'PARTNER_EMPLOYER',
      entityId: employerId,
      meta: { reason: reason ?? null, userId: result.userId }
    });

    return { ok: true, employerId, userId: result.userId, employer: result.employer };
  }

  async reject(employerId: string, adminId: string, reason: string) {
    await this.prisma.$transaction(async (tx) => {
      const employer = await tx.employer.findUnique({ where: { id: employerId } });
      if (!employer) throw new BadRequestException('Employer not found');
      if (employer.status !== 'PENDING') throw new BadRequestException('Only PENDING can be rejected');

      await tx.employer.update({ where: { id: employerId }, data: { status: 'REJECTED' } });

      if (employer.userId) {
        await tx.user.update({
          where: { id: employer.userId },
          data: { status: 'REJECTED' }
        });
      }

      await tx.employerApprovalLog.create({
        data: {
          employerId,
          action: 'REJECTED',
          reason,
          actionBy: adminId
        }
      });
    });

    await this.audit.log({
      performedBy: adminId,
      action: 'EMPLOYER_REJECTED',
      entityType: 'PARTNER_EMPLOYER',
      entityId: employerId,
      meta: { reason }
    });

    return { ok: true };
  }
}
