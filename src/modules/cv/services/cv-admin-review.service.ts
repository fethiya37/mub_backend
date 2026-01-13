// src/modules/cv/services/cv-admin-review.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';
import { CvAdminReviewRepository } from '../repositories/cv-admin-review.repository';
import { CvStatusService } from './cv-status.service';
import { CvAuditService } from './cv-audit.service';

@Injectable()
export class CvAdminReviewService {
  constructor(
    private readonly cvs: ApplicantCvRepository,
    private readonly reviews: CvAdminReviewRepository,
    private readonly status: CvStatusService,
    private readonly cvAudit: CvAuditService
  ) {}

  list(filters: any, page: number, pageSize: number) {
    return this.cvs.listForAdmin(filters, page, pageSize);
  }

  async updateStatus(adminId: string, cvId: string, dto: any) {
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');

    this.status.ensureAdminCanReview(cv.status);

    const updated = await this.cvs.update(cvId, { status: dto.status });

    await this.reviews.create({
      cvId,
      adminId,
      status: dto.status,
      comments: dto.comments ?? null
    });

    await this.cvAudit.log(cvId, 'CV_REVIEWED', adminId, { newStatus: dto.status, comments: dto.comments ?? null });

    return { ok: true, cvId, status: updated.status };
  }
}
