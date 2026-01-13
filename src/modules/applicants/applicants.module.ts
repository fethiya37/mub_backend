import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { PublicApplicantsController } from './presentation/public-applicants.controller';
import { AdminApplicantsController } from './presentation/admin-applicants.controller';
import { ApplicantProfileController } from './presentation/applicant-profile.controller';
import { ApplicantProfileRepository } from './repositories/applicant-profile.repository';
import { ApplicantDraftTokenRepository } from './repositories/applicant-draft-token.repository';
import { ApplicantProfilePrismaRepository } from './prisma/applicant-profile.prisma-repository';
import { ApplicantDraftTokenPrismaRepository } from './prisma/applicant-draft-token.prisma-repository';
import { ApplicantStatusService } from './services/applicant-status.service';
import { ApplicantDraftTokenService } from './services/applicant-draft-token.service';
import { ApplicantsService } from './services/applicants.service';
import { ApplicantReviewService } from './services/applicant-review.service';
import { ApplicantVerifiedService } from './services/applicant-verified.service';
import { DraftTokenGuard } from './guards/draft-token.guard';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [PublicApplicantsController, AdminApplicantsController, ApplicantProfileController],
  providers: [
    PrismaService,
    ApplicantStatusService,
    ApplicantDraftTokenService,
    ApplicantsService,
    ApplicantReviewService,
    ApplicantVerifiedService,
    DraftTokenGuard,
    { provide: ApplicantProfileRepository, useClass: ApplicantProfilePrismaRepository },
    { provide: ApplicantDraftTokenRepository, useClass: ApplicantDraftTokenPrismaRepository }
  ],
  exports: [ApplicantsService, ApplicantVerifiedService, ApplicantProfileRepository]
})
export class ApplicantsModule {}