import { Body, Controller, Get, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { Public } from '../../../common/decorators/public.decorator';
import { DraftUpsertApplicantDto } from '../dto/public/draft-upsert-applicant.dto';
import { SubmitApplicantDto } from '../dto/public/submit-applicant.dto';
import { IssueDraftTokenDto } from '../dto/public/issue-draft-token.dto';
import { ApplicantsService } from '../services/applicants.service';
import { DraftTokenGuard } from '../guards/draft-token.guard';
import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function applicantDiskStorage() {
  return diskStorage({
    destination: (_req, file, cb) => {
      const root = buildUploadsRoot();

      const subdir =
        file.fieldname === 'personalPhoto'
          ? 'photos'
          : file.fieldname === 'passportFile'
            ? 'passport'
            : file.fieldname === 'applicantIdFile'
              ? 'ids'
              : file.fieldname === 'cocCertificateFile'
                ? 'certificates'
                : file.fieldname.startsWith('document_')
                  ? 'documents'
                  : file.fieldname.startsWith('emergencyId_')
                    ? 'emergency-contacts'
                    : 'misc';

      const dest = join(root, 'applicants', subdir);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = safeExt(file.originalname);
      const name = crypto.randomBytes(16).toString('hex');
      cb(null, `${name}${ext}`);
    }
  });
}

@ApiTags('Public Applicants')
@Public()
@Controller('api/public/applicants')
export class PublicApplicantsController {
  constructor(private readonly applicants: ApplicantsService) {}

  @Put('draft')
  @ApiOperation({ summary: 'Create or update draft profile (SELF) and rotate Draft token (supports multipart files)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'personalPhoto', maxCount: 1 },
        { name: 'passportFile', maxCount: 1 },
        { name: 'applicantIdFile', maxCount: 1 },
        { name: 'cocCertificateFile', maxCount: 1 },
        { name: 'document_PASSPORT', maxCount: 1 },
        { name: 'document_PERSONAL_PHOTO', maxCount: 1 },
        { name: 'document_COC_CERTIFICATE', maxCount: 1 },
        { name: 'document_APPLICANT_ID', maxCount: 1 },
        { name: 'emergencyId_0', maxCount: 1 },
        { name: 'emergencyId_1', maxCount: 1 },
        { name: 'emergencyId_2', maxCount: 1 }
      ],
      {
        limits: { fileSize: maxUploadBytes() },
        storage: applicantDiskStorage()
      }
    )
  )
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
  draftUpsert(@Body() dto: DraftUpsertApplicantDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const fileUrls: Record<string, string> = {};

    for (const key of Object.keys(files || {})) {
      const f = files[key]?.[0];
      if (!f) continue;

      const dir =
        key.startsWith('emergencyId_')
          ? 'emergency-contacts'
          : key.startsWith('document_')
            ? 'documents'
            : key === 'personalPhoto'
              ? 'photos'
              : key === 'passportFile'
                ? 'passport'
                : key === 'applicantIdFile'
                  ? 'ids'
                  : key === 'cocCertificateFile'
                    ? 'certificates'
                    : 'misc';

      fileUrls[key] = `/uploads/applicants/${dir}/${f.filename}`;
    }

    return this.applicants.draftUpsertWithFiles(dto, fileUrls);
  }

  @Post('draft-token')
  @ApiOperation({ summary: 'Re-issue Draft token for DRAFT/REJECTED (optional passportNumber match)' })
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'personalPhoto', maxCount: 1 },
        { name: 'passportFile', maxCount: 1 },
        { name: 'applicantIdFile', maxCount: 1 },
        { name: 'cocCertificateFile', maxCount: 1 },
        { name: 'document_PASSPORT', maxCount: 1 },
        { name: 'document_PERSONAL_PHOTO', maxCount: 1 },
        { name: 'document_COC_CERTIFICATE', maxCount: 1 },
        { name: 'document_APPLICANT_ID', maxCount: 1 },
        { name: 'emergencyId_0', maxCount: 1 },
        { name: 'emergencyId_1', maxCount: 1 },
        { name: 'emergencyId_2', maxCount: 1 }
      ],
      {
        limits: { fileSize: maxUploadBytes() },
        storage: applicantDiskStorage()
      }
    )
  )
  @ApiOperation({ summary: 'Update draft using Draft token and rotate token (supports multipart files)' })
  @ApiResponse({
    status: 200,
    schema: { example: { ok: true, draftToken: 'base64url-token', draftTokenExpiresAt: '2026-01-23T10:00:00.000Z' } }
  })
  updateDraft(@Req() req: any, @Body() dto: DraftUpsertApplicantDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const fileUrls: Record<string, string> = {};

    for (const key of Object.keys(files || {})) {
      const f = files[key]?.[0];
      if (!f) continue;

      const dir =
        key.startsWith('emergencyId_')
          ? 'emergency-contacts'
          : key.startsWith('document_')
            ? 'documents'
            : key === 'personalPhoto'
              ? 'photos'
              : key === 'passportFile'
                ? 'passport'
                : key === 'applicantIdFile'
                  ? 'ids'
                  : key === 'cocCertificateFile'
                    ? 'certificates'
                    : 'misc';

      fileUrls[key] = `/uploads/applicants/${dir}/${f.filename}`;
    }

    return this.applicants.draftUpdateWithFiles(req.applicantId, dto, fileUrls);
  }

  @UseGuards(DraftTokenGuard)
  @ApiSecurity('draft')
  @Post('submit')
  @ApiOperation({ summary: 'Submit draft for admin review and create Applicant User (DRAFT/REJECTED → SUBMITTED)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, applicantId: 'uuid-applicant-id', userId: 'uuid-user-id' } } })
  submit(@Req() req: any, @Body() dto: SubmitApplicantDto) {
    return this.applicants.submit(req.applicantId, req.draftTokenRecordId, dto.password);
  }
}
