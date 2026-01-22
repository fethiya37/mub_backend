import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { DraftUpsertApplicantDto } from '../dto/public/draft-upsert-applicant.dto';
import { SubmitApplicantDto } from '../dto/public/submit-applicant.dto';
import { IssueDraftTokenDto } from '../dto/public/issue-draft-token.dto';
import { ApplicantsService } from '../services/applicants.service';
import { DraftTokenGuard } from '../guards/draft-token.guard';

@ApiTags('Public Applicants')
@Public()
@Controller('api/public/applicants')
export class PublicApplicantsController {
  constructor(private readonly applicants: ApplicantsService) {}

  @Put('draft')
  @ApiOperation({ summary: 'Create or update draft profile (SELF) and rotate Draft token' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        applicantId: 'uuid-applicant-id',
        draftToken: 'base64url-token',
        draftTokenExpiresAt: '2026-01-23T10:00:00.000Z'
      }
    }
  })
  draftUpsert(@Body() dto: DraftUpsertApplicantDto) {
    return this.applicants.draftUpsert(dto);
  }

  @Post('draft-token')
  @ApiOperation({ summary: 'Re-issue Draft token for DRAFT/REJECTED (optional passportNumber match)' })
  @ApiResponse({
    status: 200,
    schema: { example: { applicantId: 'uuid-applicant-id', draftToken: 'base64url-token', draftTokenExpiresAt: '2026-01-23T10:00:00.000Z' } }
  })
  issueDraftToken(@Body() dto: IssueDraftTokenDto) {
    return this.applicants.issueDraftToken(dto.phone, dto.passportNumber);
  }

  @UseGuards(DraftTokenGuard)
  @ApiSecurity('draft')
  @Get('draft/me')
  @ApiOperation({ summary: 'Get draft profile using Draft token' })
  getDraft(@Req() req: any) {
    return this.applicants.getDraft(req.applicantId);
  }

  @UseGuards(DraftTokenGuard)
  @ApiSecurity('draft')
  @Put('draft/me')
  @ApiOperation({ summary: 'Update draft using Draft token and rotate token' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, draftToken: 'base64url-token', draftTokenExpiresAt: '2026-01-23T10:00:00.000Z' } } })
  updateDraft(@Req() req: any, @Body() dto: DraftUpsertApplicantDto) {
    return this.applicants.draftUpdate(req.applicantId, dto);
  }

  @UseGuards(DraftTokenGuard)
  @ApiSecurity('draft')
  @Post('submit')
  @ApiOperation({ summary: 'Submit draft for admin review (DRAFT/REJECTED → SUBMITTED)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, applicantId: 'uuid-applicant-id' } } })
  submit(@Req() req: any, @Body() _dto: SubmitApplicantDto) {
    return this.applicants.submit(req.applicantId, req.draftTokenRecordId);
  }
}
