import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

import { JobApplicationRepository } from '../repositories/job-application.repository';
import { JobApplicationStatusService } from './job-application-status.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/constants/notification-types.constant';

import type { ApplyJobDto } from '../dto/applicant/apply-job.dto';
import type { UpdateCvDto } from '../dto/applicant/update-cv.dto';
import type { WithdrawApplicationDto } from '../dto/applicant/withdraw-application.dto';
import type { ListMyApplicationsQueryDto } from '../dto/applicant/list-my-applications.query.dto';

import type { AdminCreateApplicationDto } from '../dto/admin/admin-create-application.dto';
import type { AdminListApplicationsQueryDto } from '../dto/admin/admin-list-applications.query.dto';
import type { AdminApproveApplicationDto } from '../dto/admin/admin-approve-application.dto';
import type { AdminRejectApplicationDto } from '../dto/admin/admin-reject-application.dto';
import type { AdminUpdateCvDto } from '../dto/admin/admin-update-cv.dto';

import type { EmployerListApplicationsQueryDto } from '../dto/employer/employer-list-applications.query.dto';
import type { EmployerDecideApplicationDto } from '../dto/employer/employer-decide-application.dto';

import { safeDeleteUploadByRelativePath } from '../../../common/utils/upload/upload.utils';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: JobApplicationRepository,
    private readonly status: JobApplicationStatusService,
    private readonly notifications: NotificationsService,
  ) {}

  private page(v?: number) {
    return v && v > 0 ? v : 1;
  }

  private pageSize(v?: number, def = 20) {
    const n = v && v > 0 ? v : def;
    return n > 200 ? 200 : n;
  }

  private requireCvFileUrl(v: string | null | undefined) {
    if (!v) throw new BadRequestException('cvFileUrl is required');
    return v;
  }

  private async getApplicantIdByUserId(userId: string) {
    const applicant = await this.prisma.applicantProfile.findFirst({
      where: { userId },
      select: { applicantId: true },
    });

    if (!applicant) throw new NotFoundException('Applicant profile not found');
    return applicant.applicantId;
  }

  private async getApplicantUserId(applicantId: string) {
    const applicant = await this.prisma.applicantProfile.findUnique({
      where: { applicantId },
      select: { userId: true },
    });
    return applicant?.userId ?? null;
  }

  private async getEmployerIdByUserId(userId: string) {
    const employer = await this.prisma.employer.findFirst({
      where: { userId },
      select: { id: true, status: true },
    });

    if (!employer) throw new NotFoundException('Employer not found');
    if (employer.status !== 'APPROVED')
      throw new BadRequestException('Employer not approved');
    return employer.id;
  }

  async applyAsApplicant(userId: string, dto: ApplyJobDto) {
    const applicantId = await this.getApplicantIdByUserId(userId);

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobPostingId },
      include: {
        employer: { select: { userId: true, organizationName: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'ACTIVE')
      throw new BadRequestException('Job is not open for applications');

    const existing = await this.repo.findByApplicantJob(
      applicantId,
      dto.jobPostingId,
    );
    this.status.ensureCanApply(existing?.status ?? null);

    const result = await this.repo.applyOrReapply({
      applicantId,
      jobPostingId: dto.jobPostingId,
      cvFileUrl: this.requireCvFileUrl(dto.cvFileUrl),
    });

    if (job.employer?.userId) {
      await this.notifications.create(
        job.employer.userId,
        NOTIFICATION_TYPES.JOB_APPLICATION_RECEIVED,
        'New Job Application Received',
        `A candidate has applied for "${job.jobTitle}"`,
      );
    }

    return result;
  }

  async updateCvAsApplicant(
    userId: string,
    applicationId: string,
    dto: UpdateCvDto,
  ) {
    const applicantId = await this.getApplicantIdByUserId(userId);

    const app = await this.repo.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== applicantId)
      throw new ForbiddenException('Not allowed');

    this.status.ensureCvEditable(app.status);

    const nextCv = this.requireCvFileUrl(dto.cvFileUrl);
    const updated = await this.repo.updateCv(applicationId, nextCv);

    if (app.cvFileUrl && app.cvFileUrl !== nextCv) {
      await safeDeleteUploadByRelativePath(app.cvFileUrl);
    }

    return updated;
  }

  async withdrawAsApplicant(
    userId: string,
    applicationId: string,
    dto: WithdrawApplicationDto,
  ) {
    const applicantId = await this.getApplicantIdByUserId(userId);

    const app = await this.repo.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');
    if (app.applicantId !== applicantId)
      throw new ForbiddenException('Not allowed');

    this.status.ensureWithdrawAllowed(app.status);

    return this.repo.setStatus(applicationId, 'WITHDRAWN');
  }

  async listMyApplications(userId: string, q: ListMyApplicationsQueryDto) {
    const applicantId = await this.getApplicantIdByUserId(userId);
    return this.repo.listMy(
      applicantId,
      { status: q.status, jobPostingId: q.jobPostingId },
      this.page(q.page),
      this.pageSize(q.pageSize, 20),
    );
  }

  async createAsAdmin(adminUserId: string, dto: AdminCreateApplicationDto) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobPostingId },
      include: {
        employer: { select: { userId: true, organizationName: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'ACTIVE')
      throw new BadRequestException('Job is not open for applications');

    const applicant = await this.prisma.applicantProfile.findUnique({
      where: { applicantId: dto.applicantId },
      select: { applicantId: true, userId: true },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');

    const existing = await this.repo.findByApplicantJob(
      dto.applicantId,
      dto.jobPostingId,
    );
    this.status.ensureCanApply(existing?.status ?? null);

    const result = await this.repo.applyOrReapply({
      applicantId: dto.applicantId,
      jobPostingId: dto.jobPostingId,
      cvFileUrl: this.requireCvFileUrl(dto.cvFileUrl),
    });

    if (applicant.userId) {
      await this.notifications.create(
        applicant.userId,
        NOTIFICATION_TYPES.JOB_APPLICATION_RECEIVED,
        'Application Submitted',
        `An admin submitted an application for you to "${job.jobTitle}"`,
      );
    }

    if (job.employer?.userId) {
      await this.notifications.create(
        job.employer.userId,
        NOTIFICATION_TYPES.JOB_APPLICATION_RECEIVED,
        'New Job Application Received',
        `A candidate has applied for "${job.jobTitle}"`,
      );
    }

    return result;
  }

  listAdminApplications(q: AdminListApplicationsQueryDto) {
    return this.repo.listAdmin(
      {
        status: q.status,
        jobPostingId: q.jobPostingId,
        applicantId: q.applicantId,
      },
      this.page(q.page),
      this.pageSize(q.pageSize, 50),
    );
  }

  async updateCvAsAdmin(
    adminUserId: string,
    applicationId: string,
    dto: AdminUpdateCvDto,
  ) {
    const app = await this.repo.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    this.status.ensureCvEditable(app.status);

    const nextCv = this.requireCvFileUrl(dto.cvFileUrl);
    const updated = await this.repo.updateCv(applicationId, nextCv);

    if (app.cvFileUrl && app.cvFileUrl !== nextCv) {
      await safeDeleteUploadByRelativePath(app.cvFileUrl);
    }

    return updated;
  }

  async approveAsAdmin(
    adminUserId: string,
    applicationId: string,
    dto: AdminApproveApplicationDto,
  ) {
    const app = await this.repo.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    this.status.ensureAdminCanApprove(app.status);

    const result = await this.repo.setStatus(applicationId, 'APPROVED');

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: app.jobPostingId },
      include: { employer: { select: { userId: true } } },
    });

    const applicantUserId = await this.getApplicantUserId(app.applicantId);

    if (applicantUserId) {
      await this.notifications.create(
        applicantUserId,
        NOTIFICATION_TYPES.JOB_APPLICATION_STATUS_CHANGE,
        'Application Approved',
        `Your application for "${job?.jobTitle}" has been approved and forwarded to the employer`,
      );
    }

    if (job?.employer?.userId) {
      await this.notifications.create(
        job.employer.userId,
        NOTIFICATION_TYPES.JOB_APPLICATION_STATUS_CHANGE,
        'Application Ready for Review',
        `An application for "${job.jobTitle}" is ready for your decision`,
      );
    }

    return result;
  }

  async rejectAsAdmin(
    adminUserId: string,
    applicationId: string,
    dto: AdminRejectApplicationDto,
  ) {
    const app = await this.repo.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    this.status.ensureAdminCanReject(app.status);

    const result = await this.repo.setStatus(applicationId, 'REJECTED');

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: app.jobPostingId },
      select: { jobTitle: true },
    });

    const applicantUserId = await this.getApplicantUserId(app.applicantId);

    if (applicantUserId) {
      await this.notifications.create(
        applicantUserId,
        NOTIFICATION_TYPES.JOB_APPLICATION_STATUS_CHANGE,
        'Application Rejected',
        `Your application for "${job?.jobTitle}" was rejected by admin`,
      );
    }

    return result;
  }

  async listEmployerApplications(
    userId: string,
    q: EmployerListApplicationsQueryDto,
  ) {
    const employerId = await this.getEmployerIdByUserId(userId);

    return this.repo.listEmployer(
      { employerId, status: q.status, jobPostingId: q.jobPostingId },
      this.page(q.page),
      this.pageSize(q.pageSize, 50),
    );
  }

  async decideAsEmployer(
    userId: string,
    applicationId: string,
    dto: EmployerDecideApplicationDto,
  ) {
    const employerId = await this.getEmployerIdByUserId(userId);

    const app = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, jobPostingId: true, applicantId: true },
    });

    if (!app) throw new NotFoundException('Application not found');

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: app.jobPostingId },
      include: {
        employer: { select: { userId: true, organizationName: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.employerId !== employerId)
      throw new ForbiddenException('Not allowed');

    this.status.ensureEmployerCanDecide(app.status);

    const applicantUserId = await this.getApplicantUserId(app.applicantId);

    if (dto.decision === 'SELECT') {
      const result = await this.repo.setStatus(applicationId, 'SELECTED');

      if (applicantUserId) {
        await this.notifications.create(
          applicantUserId,
          NOTIFICATION_TYPES.JOB_APPLICATION_STATUS_CHANGE,
          'Congratulations! You Have Been Selected! 🎉',
          `The employer has selected you for "${job.jobTitle}"`,
        );
      }

      return result;
    }

    const result = await this.repo.setStatus(applicationId, 'REJECTED');

    if (applicantUserId) {
      await this.notifications.create(
        applicantUserId,
        NOTIFICATION_TYPES.JOB_APPLICATION_STATUS_CHANGE,
        'Application Update',
        `The employer has rejected your application for "${job.jobTitle}"`,
      );
    }

    return result;
  }
}
