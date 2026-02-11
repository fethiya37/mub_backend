import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthService } from '../../auth/services/auth.service';
import { LocalAgencyRepository } from '../repositories/local-agency.repository';
import { LocalAgencyApprovalLogRepository } from '../repositories/local-agency-approval-log.repository';
import { LocalAgencyStatusService } from './local-agency-status.service';

@Injectable()
export class LocalAgencyReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agencies: LocalAgencyRepository,
    private readonly logs: LocalAgencyApprovalLogRepository,
    private readonly status: LocalAgencyStatusService,
    private readonly audit: AuditService,
    private readonly auth: AuthService
  ) {}

  private buildAgencyUserFullName(agency: any) {
    const name = String(agency.name ?? '').trim();
    if (name) return name;
    return 'Local Agency';
  }

  async list(status: string | undefined, page = 1, pageSize = 50) {
    return this.agencies.listByStatus(status, page, pageSize);
  }

  async get(id: string) {
    const agency = await this.agencies.findById(id);
    if (!agency) throw new NotFoundException('Local agency not found');
    const approvalLogs = await this.logs.listByAgency(id);
    return { ...agency, approvalLogs };
  }

  async approve(id: string, adminId: string, reason?: string) {
    const agency = await this.agencies.findById(id);
    if (!agency) throw new NotFoundException('Local agency not found');

    this.status.ensureCanApprove(agency.status);

    if (!agency.phone) throw new BadRequestException('Agency phone missing');
    if (!agency.email) throw new BadRequestException('Agency email missing');

    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.localAgency.findUnique({ where: { id } });
      if (!current) throw new BadRequestException('Local agency not found');
      if (current.status !== 'PENDING') throw new BadRequestException('Only PENDING can be approved');
      if (current.userId) throw new BadRequestException('Agency user already linked');

      const existingByPhone = await tx.user.findUnique({ where: { phone: current.phone! } });
      if (existingByPhone) throw new ConflictException('User already exists with this phone');

      const existingByEmail = await tx.user.findUnique({ where: { email: current.email! } });
      if (existingByEmail) throw new ConflictException('User already exists with this email');

      const role = await tx.role.findUnique({ where: { name: 'LOCAL_AGENCY' } });
      if (!role) throw new BadRequestException('LOCAL_AGENCY role missing');

      const unusablePasswordHash = crypto.randomBytes(48).toString('base64url');
      const fullName = this.buildAgencyUserFullName(current);

      const user = await tx.user.create({
        data: {
          phone: current.phone!,
          email: current.email!,
          passwordHash: unusablePasswordHash,
          isActive: true,
          applicantVerified: false,
          status: 'APPROVED',
          fullName
        }
      });

      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

      const updated = await tx.localAgency.update({
        where: { id },
        data: {
          status: 'APPROVED',
          userId: user.id,
          rejectionReason: null,
          approvedBy: adminId,
          approvedAt: new Date(),
          suspendedAt: null
        }
      });

      await tx.localAgencyApprovalLog.create({
        data: {
          agencyId: id,
          action: 'APPROVED',
          reason: reason ?? null,
          actionBy: adminId
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } }
      });

      return { userId: user.id, email: user.email, agencyName: updated.name, agency: updated };
    });

    await this.auth.sendAccountSetupEmail(result.userId, result.email!, result.agencyName);

    await this.audit.log({
      performedBy: adminId,
      action: 'LOCAL_AGENCY_APPROVED',
      entityType: 'LocalAgency',
      entityId: id,
      meta: { reason: reason ?? null, userId: result.userId }
    });

    return { ok: true, agencyId: id, userId: result.userId, agency: result.agency };
  }

  async reject(id: string, adminId: string, reason: string) {
    const agency = await this.agencies.findById(id);
    if (!agency) throw new NotFoundException('Local agency not found');

    this.status.ensureCanReject(agency.status);

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.localAgency.findUnique({ where: { id } });
      if (!current) throw new BadRequestException('Local agency not found');
      if (current.status !== 'PENDING') throw new BadRequestException('Only PENDING can be rejected');
      if (current.userId) throw new BadRequestException('Agency already linked to user');

      await tx.localAgency.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          approvedBy: null,
          approvedAt: null
        }
      });

      await tx.localAgencyApprovalLog.create({
        data: {
          agencyId: id,
          action: 'REJECTED',
          reason,
          actionBy: adminId
        }
      });
    });

    await this.audit.log({
      performedBy: adminId,
      action: 'LOCAL_AGENCY_REJECTED',
      entityType: 'LocalAgency',
      entityId: id,
      meta: { reason }
    });

    return { ok: true, agencyId: id };
  }

  async suspend(id: string, adminId: string, reason: string) {
    const agency = await this.agencies.findById(id);
    if (!agency) throw new NotFoundException('Local agency not found');

    this.status.ensureCanSuspend(agency.status);

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.localAgency.findUnique({ where: { id } });
      if (!current) throw new BadRequestException('Local agency not found');
      if (current.status !== 'APPROVED') throw new BadRequestException('Only APPROVED can be suspended');
      if (!current.userId) throw new BadRequestException('Agency user missing');

      await tx.localAgency.update({
        where: { id },
        data: {
          status: 'SUSPENDED',
          suspendedAt: new Date()
        }
      });

      await tx.user.update({
        where: { id: current.userId },
        data: {
          isActive: false,
          tokenVersion: { increment: 1 }
        }
      });

      await tx.localAgencyApprovalLog.create({
        data: {
          agencyId: id,
          action: 'SUSPENDED',
          reason,
          actionBy: adminId
        }
      });
    });

    await this.audit.log({
      performedBy: adminId,
      action: 'LOCAL_AGENCY_SUSPENDED',
      entityType: 'LocalAgency',
      entityId: id,
      meta: { reason }
    });

    return { ok: true, agencyId: id };
  }

  async reactivate(id: string, adminId: string, reason?: string) {
    const agency = await this.agencies.findById(id);
    if (!agency) throw new NotFoundException('Local agency not found');

    this.status.ensureCanReactivate(agency.status);

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.localAgency.findUnique({ where: { id } });
      if (!current) throw new BadRequestException('Local agency not found');
      if (current.status !== 'SUSPENDED') throw new BadRequestException('Only SUSPENDED can be reactivated');
      if (!current.userId) throw new BadRequestException('Agency user missing');

      await tx.localAgency.update({
        where: { id },
        data: {
          status: 'APPROVED',
          suspendedAt: null
        }
      });

      await tx.user.update({
        where: { id: current.userId },
        data: {
          isActive: true,
          tokenVersion: { increment: 1 }
        }
      });

      await tx.localAgencyApprovalLog.create({
        data: {
          agencyId: id,
          action: 'REACTIVATED',
          reason: reason ?? null,
          actionBy: adminId
        }
      });
    });

    await this.audit.log({
      performedBy: adminId,
      action: 'LOCAL_AGENCY_REACTIVATED',
      entityType: 'LocalAgency',
      entityId: id,
      meta: { reason: reason ?? null }
    });

    return { ok: true, agencyId: id };
  }
}
7