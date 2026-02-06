import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmployerAccessService } from './employer-access.service';
import { JobPostingRepository } from '../repositories/job-posting.repository';
import { AuditService } from '../../audit/services/audit.service';
import type { CreateJobDto } from '../dto/create-job.dto';
import type { UpdateJobDto } from '../dto/update-job.dto';
import type { AdminCreateJobForEmployerDto } from '../dto/admin/admin-create-job-for-employer.dto';
import type { AdminUpdateJobForEmployerDto } from '../dto/admin/admin-update-job-for-employer.dto';
import { safeDeleteUploadByRelativePath } from '../../../common/utils/upload/upload.utils';

type JobFileOverrides = {
  thumbnailUrl?: string | null;
};

function normalizeUploadPath(v: string | null | undefined) {
  if (v === undefined) return undefined;
  if (v === null) return null;

  const s = String(v).trim();
  if (!s) return null;

  const idx = s.indexOf('/uploads/');
  if (idx >= 0) return s.slice(idx);

  return s.startsWith('/uploads/') ? s : s;
}

@Injectable()
export class EmployerJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EmployerAccessService,
    private readonly jobs: JobPostingRepository,
    private readonly audit: AuditService
  ) {}

  private async deleteIfReplaced(oldPath: string | null | undefined, nextPath: string | null | undefined) {
    if (!oldPath) return;
    if (oldPath === nextPath) return;
    await safeDeleteUploadByRelativePath(oldPath);
  }

  async create(userId: string, dto: CreateJobDto, files?: JobFileOverrides) {
    const employer = await this.access.getEmployerForUser(userId);
    this.access.ensureApproved(employer);

    const thumbnailUrl = normalizeUploadPath(files?.thumbnailUrl !== undefined ? files.thumbnailUrl : dto.thumbnailUrl ?? null);

    const job = await this.jobs.create(employer.id, {
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
      country: dto.country,
      city: dto.city ?? null,
      salaryRange: dto.salaryRange ?? null,
      thumbnailUrl,
      vacancies: dto.vacancies,
      contractType: dto.contractType,
      status: dto.status ?? 'DRAFT'
    });

    await this.audit.log({
      performedBy: userId,
      action: 'JOB_CREATED',
      entityType: 'JobPosting',
      entityId: job.id,
      meta: { employerId: employer.id }
    });

    return job;
  }

  async update(userId: string, jobId: string, dto: UpdateJobDto, files?: JobFileOverrides) {
    const employer = await this.access.getEmployerForUser(userId);
    this.access.ensureApproved(employer);

    const existing = await this.jobs.findById(jobId);
    if (!existing) throw new NotFoundException('Job not found');
    if (existing.employerId !== employer.id) throw new ForbiddenException('Not allowed');

    if (dto.status === 'ACTIVE' && employer.status !== 'APPROVED') {
      throw new BadRequestException('Employer not approved');
    }

    const requestedThumb =
      files?.thumbnailUrl !== undefined
        ? normalizeUploadPath(files.thumbnailUrl)
        : dto.thumbnailUrl === undefined
          ? undefined
          : normalizeUploadPath(dto.thumbnailUrl);

    const nextThumbnailUrl = requestedThumb === undefined ? existing.thumbnailUrl : requestedThumb;

    const updateData = {
      ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
      ...(dto.jobDescription !== undefined ? { jobDescription: dto.jobDescription } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.city !== undefined ? { city: dto.city ?? null } : {}),
      ...(dto.salaryRange !== undefined ? { salaryRange: dto.salaryRange ?? null } : {}),
      ...(dto.vacancies !== undefined ? { vacancies: dto.vacancies } : {}),
      ...(dto.contractType !== undefined ? { contractType: dto.contractType } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(requestedThumb !== undefined ? { thumbnailUrl: nextThumbnailUrl } : {})
    };

    const job = await this.jobs.update(jobId, updateData as any);

    if (requestedThumb !== undefined) {
      await this.deleteIfReplaced(existing.thumbnailUrl, nextThumbnailUrl);
    }

    await this.audit.log({
      performedBy: userId,
      action: 'JOB_UPDATED',
      entityType: 'JobPosting',
      entityId: job.id,
      meta: { employerId: employer.id }
    });

    return job;
  }

  async list(userId: string, status: string | undefined, page: number, pageSize: number) {
    const employer = await this.access.getEmployerForUser(userId);
    this.access.ensureApproved(employer);
    return this.jobs.listByEmployer(employer.id, status, page, pageSize);
  }

  async adminCreate(adminUserId: string, dto: AdminCreateJobForEmployerDto, files?: JobFileOverrides) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: dto.employerId },
      select: { id: true, status: true }
    });

    if (!employer) throw new NotFoundException('Employer not found');
    if (employer.status !== 'APPROVED') throw new BadRequestException('Employer not approved');

    const thumbnailUrl = normalizeUploadPath(files?.thumbnailUrl !== undefined ? files.thumbnailUrl : dto.thumbnailUrl ?? null);

    const job = await this.jobs.create(employer.id, {
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
      country: dto.country,
      city: dto.city ?? null,
      salaryRange: dto.salaryRange ?? null,
      thumbnailUrl,
      vacancies: dto.vacancies,
      contractType: dto.contractType,
      status: dto.status ?? 'DRAFT'
    });

    await this.audit.log({
      performedBy: adminUserId,
      action: 'JOB_CREATED_BY_ADMIN',
      entityType: 'JobPosting',
      entityId: job.id,
      meta: { employerId: employer.id }
    });

    return job;
  }

  async adminUpdate(adminUserId: string, dto: AdminUpdateJobForEmployerDto, files?: JobFileOverrides) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: dto.employerId },
      select: { id: true, status: true }
    });

    if (!employer) throw new NotFoundException('Employer not found');
    if (employer.status !== 'APPROVED') throw new BadRequestException('Employer not approved');

    const existing = await this.jobs.findById(dto.jobId);
    if (!existing) throw new NotFoundException('Job not found');
    if (existing.employerId !== employer.id) throw new ForbiddenException('Not allowed');

    if (dto.status === 'ACTIVE' && employer.status !== 'APPROVED') {
      throw new BadRequestException('Employer not approved');
    }

    const requestedThumb =
      files?.thumbnailUrl !== undefined
        ? normalizeUploadPath(files.thumbnailUrl)
        : dto.thumbnailUrl === undefined
          ? undefined
          : normalizeUploadPath(dto.thumbnailUrl);

    const nextThumbnailUrl = requestedThumb === undefined ? existing.thumbnailUrl : requestedThumb;

    const updateData = {
      ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
      ...(dto.jobDescription !== undefined ? { jobDescription: dto.jobDescription } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.city !== undefined ? { city: dto.city ?? null } : {}),
      ...(dto.salaryRange !== undefined ? { salaryRange: dto.salaryRange ?? null } : {}),
      ...(dto.vacancies !== undefined ? { vacancies: dto.vacancies } : {}),
      ...(dto.contractType !== undefined ? { contractType: dto.contractType } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(requestedThumb !== undefined ? { thumbnailUrl: nextThumbnailUrl } : {})
    };

    const job = await this.jobs.update(dto.jobId, updateData as any);

    if (requestedThumb !== undefined) {
      await this.deleteIfReplaced(existing.thumbnailUrl, nextThumbnailUrl);
    }

    await this.audit.log({
      performedBy: adminUserId,
      action: 'JOB_UPDATED_BY_ADMIN',
      entityType: 'JobPosting',
      entityId: job.id,
      meta: { employerId: employer.id }
    });

    return job;
  }

  async adminGet(jobId: string) {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async adminList(
    filters: { status?: string; employerId?: string; country?: string; city?: string },
    page: number,
    pageSize: number
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status.toUpperCase();
    if (filters.employerId) where.employerId = filters.employerId;
    if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobPosting.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take: pageSize }),
      this.prisma.jobPosting.count({ where })
    ]);

    return { items, total };
  }
}
