import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CvAdminReviewCreate, CvAdminReviewRepository } from '../repositories/cv-admin-review.repository';

@Injectable()
export class CvAdminReviewPrismaRepository extends CvAdminReviewRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: CvAdminReviewCreate) {
    return this.prisma.cvAdminReview.create({ data: input as any });
  }

  listByCv(cvId: string) {
    return this.prisma.cvAdminReview.findMany({ where: { cvId }, orderBy: { reviewedAt: 'desc' } });
  }
}
