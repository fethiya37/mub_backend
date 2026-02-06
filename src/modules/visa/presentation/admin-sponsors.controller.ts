import { Body, Controller, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { SponsorsService } from '../services/sponsors.service';
import { AdminUpsertSponsorDto } from '../dto/admin/admin-upsert-sponsor.dto';

import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function sponsorDiskStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const root = buildUploadsRoot();
      const dest = join(root, 'visa', 'sponsors');
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

@ApiTags('Admin Sponsors')
@ApiBearerAuth()
@Controller('api/admin/visa/sponsors')
export class AdminSponsorsController {
  constructor(private readonly sponsors: SponsorsService) {}

  @RequirePermissions('VISA_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create sponsor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'sponsorIdFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: sponsorDiskStorage()
    })
  )
  create(
    @Body() dto: AdminUpsertSponsorDto,
    @UploadedFiles() files: { sponsorIdFile?: Express.Multer.File[] }
  ) {
    const sponsorIdFileUrl = files?.sponsorIdFile?.[0]
      ? `/uploads/visa/sponsors/${files.sponsorIdFile[0].filename}`
      : dto.sponsorIdFileUrl;

    return this.sponsors.create({
      ...dto,
      sponsorIdFileUrl: sponsorIdFileUrl ?? undefined
    });
  }

  @RequirePermissions('VISA_UPDATE')
  @Put(':id')
  @ApiOperation({ summary: 'Update sponsor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'sponsorIdFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: sponsorDiskStorage()
    })
  )
  update(
    @Param('id') id: string,
    @Body() dto: AdminUpsertSponsorDto,
    @UploadedFiles() files: { sponsorIdFile?: Express.Multer.File[] }
  ) {
    const sponsorIdFileUrl = files?.sponsorIdFile?.[0]
      ? `/uploads/visa/sponsors/${files.sponsorIdFile[0].filename}`
      : dto.sponsorIdFileUrl;

    return this.sponsors.update(id, {
      ...dto,
      sponsorIdFileUrl: sponsorIdFileUrl ?? undefined
    });
  }
}
