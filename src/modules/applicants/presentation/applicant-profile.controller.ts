import { Body, Controller, Get, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApplicantVerifiedService } from '../services/applicant-verified.service';
import { UpdateVerifiedApplicantDto } from '../dto/applicant/update-verified-applicant.dto';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';
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
  @ApiOperation({ summary: 'Update my profile (VERIFIED) (supports multipart files)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'personalPhoto', maxCount: 1 },
        { name: 'passportFile', maxCount: 1 },
        { name: 'applicantIdFile', maxCount: 1 },
        { name: 'cocCertificateFile', maxCount: 1 }
      ],
      {
        limits: { fileSize: maxUploadBytes() },
        storage: applicantDiskStorage()
      }
    )
  )
  async update(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: UpdateVerifiedApplicantDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>
  ) {
    const skills = parseJsonArray(dto.skills as any);
    const qualifications = parseJsonArray(dto.qualifications as any);
    const workExperiences = parseJsonArray(dto.workExperiences as any);
    const documents = parseJsonArray(dto.documents as any);

    const resolvedDto: any = {
      ...dto,
      skills,
      qualifications,
      workExperiences,
      documents
    };

    const fileUrls: Record<string, string> = {};
    for (const key of Object.keys(files || {})) {
      const f = files[key]?.[0];
      if (!f) continue;
      fileUrls[key] = `/uploads/applicants/${key === 'personalPhoto' ? 'photos' : key === 'passportFile' ? 'passport' : key === 'applicantIdFile' ? 'ids' : key === 'cocCertificateFile' ? 'certificates' : 'misc'}/${f.filename}`;
    }

    const profile = await this.profiles.findByUserId(user.userId);
    const current = profile ?? (await this.verified.getByUserId(user.userId));

    return this.verified.updateVerifiedWithFiles(current.applicantId, resolvedDto, current.profileStatus, fileUrls);
  }
}
