import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApplicantVerifiedService } from '../services/applicant-verified.service';
import { UpdateVerifiedApplicantDto } from '../dto/applicant/update-verified-applicant.dto';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';

@ApiTags('Applicant')
@ApiBearerAuth()
@Controller('api/applicant')
export class ApplicantProfileController {
  constructor(
    private readonly verified: ApplicantVerifiedService,
    private readonly profiles: ApplicantProfileRepository
  ) {}

  @RequirePermissions('APPLICANT_SELF_VIEW')
  @Get('profile')
  @ApiOperation({ summary: 'Get my profile (VERIFIED)' })
  async get(@CurrentUserDecorator() user: CurrentUser) {
    const profile = await this.profiles.findByUserId(user.userId);
    return profile ?? this.verified.getByUserId(user.userId);
  }

  @RequirePermissions('APPLICANT_SELF_UPDATE')
  @Put('profile')
  @ApiOperation({ summary: 'Update my profile (VERIFIED)' })
  async update(@CurrentUserDecorator() user: CurrentUser, @Body() dto: UpdateVerifiedApplicantDto) {
    const profile = await this.profiles.findByUserId(user.userId);
    const current = profile ?? (await this.verified.getByUserId(user.userId));
    return this.verified.updateVerified(current.applicantId, dto, current.profileStatus);
  }
}
