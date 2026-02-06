import { Body, Controller, Get, Post, Put, Param, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { DraftUpsertApplicantDto } from '../dto/public/draft-upsert-applicant.dto';
import { ApplicantsService } from '../services/applicants.service';
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

function parseJsonArray<T>(v: any): T[] | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (Array.isArray(v)) return v as any;
  if (typeof v === 'string') return JSON.parse(v) as T[];
  return undefined;
}

@ApiTags('Local Agency Applicants')
@ApiBearerAuth()
@Controller('api/local-agency/applicants')
export class AgentApplicantsController {
  constructor(private readonly applicants: ApplicantsService) {}

  @RequirePermissions('APPLICANT_CREATE')
  @Put()
  @ApiOperation({ summary: 'Create/update applicant draft by Local Agency (supports multipart files)' })
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
  upsert(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: DraftUpsertApplicantDto,
    @UploadedFiles()
    files: Record<string, Express.Multer.File[]>
  ) {
    const skills = parseJsonArray(dto.skills as any);
    const qualifications = parseJsonArray(dto.qualifications as any);
    const workExperiences = parseJsonArray(dto.workExperiences as any);
    const documents = parseJsonArray(dto.documents as any);
    const emergencyContacts = parseJsonArray(dto.emergencyContacts as any);

    const resolvedDto: any = {
      ...dto,
      skills,
      qualifications,
      workExperiences,
      documents,
      emergencyContacts
    };

    const fileUrls: Record<string, string> = {};
    for (const key of Object.keys(files || {})) {
      const f = files[key]?.[0];
      if (!f) continue;
      fileUrls[key] = `/uploads/applicants/${key.startsWith('emergencyId_') ? 'emergency-contacts' : key.startsWith('document_') ? 'documents' : key === 'personalPhoto' ? 'photos' : key === 'passportFile' ? 'passport' : key === 'applicantIdFile' ? 'ids' : key === 'cocCertificateFile' ? 'certificates' : 'misc'}/${f.filename}`;
    }

    return this.applicants.agentDraftUpsertWithFiles(user.userId, resolvedDto, fileUrls);
  }

  @RequirePermissions('APPLICANT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applicants created by this Local Agency' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.applicants.agentList(user.userId, status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Post(':applicantId/submit')
  @ApiOperation({ summary: 'Submit applicant created by this Local Agency (DRAFT/REJECTED → SUBMITTED)' })
  submit(@CurrentUserDecorator() user: CurrentUser, @Param('applicantId') applicantId: string) {
    return this.applicants.agentSubmit(user.userId, applicantId);
  }
}
