import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployerAccessService } from './employer-access.service';
import { JobPostingRepository } from '../repositories/job-posting.repository';
import { AuditService } from '../../audit/services/audit.service';
import type { CreateJobDto } from '../dto/create-job.dto';
import type { UpdateJobDto } from '../dto/update-job.dto';

@Injectable()
export class EmployerJobsService {
  constructor(
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
}
