import { Body, Controller, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { EmployerJobsService } from '../services/employer-jobs.service';
import { AdminCreateJobForEmployerDto } from '../dto/admin/admin-create-job-for-employer.dto';
import { AdminUpdateJobForEmployerDto } from '../dto/admin/admin-update-job-for-employer.dto';

import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function jobThumbDiskStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const root = buildUploadsRoot();
      const dest = join(root, 'jobs', 'thumbnails');
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

@ApiTags('Admin Jobs')
@ApiBearerAuth()
@Controller('api/admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobs: EmployerJobsService) {}

  @RequirePermissions('JOB_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create job on behalf of employer (MUB Admin/Staff)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: jobThumbDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  createForEmployer(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateJobForEmployerDto,
    @UploadedFile() thumbnail?: Express.Multer.File
  ) {
    const thumbnailUrl = thumbnail ? `/uploads/jobs/thumbnails/${thumbnail.filename}` : dto.thumbnailUrl;
    return this.jobs.adminCreate(user.userId, dto, { thumbnailUrl });
  }

  @RequirePermissions('JOB_UPDATE')
  @Put()
  @ApiOperation({ summary: 'Update job on behalf of employer (MUB Admin/Staff)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: jobThumbDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  updateForEmployer(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpdateJobForEmployerDto,
    @UploadedFile() thumbnail?: Express.Multer.File
  ) {
    const thumbnailUrl = thumbnail ? `/uploads/jobs/thumbnails/${thumbnail.filename}` : dto.thumbnailUrl;
    return this.jobs.adminUpdate(user.userId, dto, { thumbnailUrl });
  }
}
