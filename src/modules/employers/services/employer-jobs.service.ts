import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmployerAccessService } from './employer-access.service';
import { JobPostingRepository } from '../repositories/job-posting.repository';
import { AuditService } from '../../audit/services/audit.service';
import type { CreateJobDto } from '../dto/create-job.dto';
import type { UpdateJobDto } from '../dto/update-job.dto';
import type { AdminCreateJobForEmployerDto } from '../dto/admin/admin-create-job-for-employer.dto';
import type { AdminUpdateJobForEmployerDto } from '../dto/admin/admin-update-job-for-employer.dto';

@Injectable()
export class EmployerJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EmployerAccessService,
    private readonly jobs: JobPostingRepository,
    private readonly audit: AuditService
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    const employer = await this.access.getEmployerForUser(userId);
    this.access.ensureApproved(employer);

    const job = await this.jobs.create(employer.id, {
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
      country: dto.country,
      city: dto.city ?? null,
      salaryRange: dto.salaryRange ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
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

  async update(userId: string, jobId: string, dto: UpdateJobDto) {
    const employer = await this.access.getEmployerForUser(userId);
    this.access.ensureApproved(employer);

    const existing = await this.jobs.findById(jobId);
    if (!existing) throw new NotFoundException('Job not found');
    if (existing.employerId !== employer.id) throw new ForbiddenException('Not allowed');

    if (dto.status === 'ACTIVE' && employer.status !== 'APPROVED') {
      throw new BadRequestException('Employer not approved');
    }

    const job = await this.jobs.update(jobId, dto as any);

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

  async adminCreate(adminUserId: string, dto: AdminCreateJobForEmployerDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: dto.employerId },
      select: { id: true, status: true }
    });

    if (!employer) throw new NotFoundException('Employer not found');
    if (employer.status !== 'APPROVED') throw new BadRequestException('Employer not approved');

    const job = await this.jobs.create(employer.id, {
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
      country: dto.country,
      city: dto.city ?? null,
      salaryRange: dto.salaryRange ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
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

  async adminUpdate(adminUserId: string, dto: AdminUpdateJobForEmployerDto) {
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

    const job = await this.jobs.update(dto.jobId, dto as any);

    await this.audit.log({
      performedBy: adminUserId,
      action: 'JOB_UPDATED_BY_ADMIN',
      entityType: 'JobPosting',
      entityId: job.id,
      meta: { employerId: employer.id }
    });

    return job;
  }
}
