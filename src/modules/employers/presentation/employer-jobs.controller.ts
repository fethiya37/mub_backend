import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { EmployerJobsService } from '../services/employer-jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

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

@ApiTags('Employer Jobs')
@ApiBearerAuth()
@Controller('api/employer/jobs')
export class EmployerJobsController {
  constructor(private readonly jobs: EmployerJobsService) {}

  @RequirePermissions('JOB_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create job (APPROVED employer only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: jobThumbDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateJobDto,
    @UploadedFile() thumbnail?: Express.Multer.File
  ) {
    const thumbnailUrl = thumbnail ? `/uploads/jobs/thumbnails/${thumbnail.filename}` : dto.thumbnailUrl;
    return this.jobs.create(user.userId, dto, { thumbnailUrl });
  }

  @RequirePermissions('JOB_UPDATE')
  @Put(':id')
  @ApiOperation({ summary: 'Update job (own jobs only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: jobThumbDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  update(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @UploadedFile() thumbnail?: Express.Multer.File
  ) {
    const thumbnailUrl = thumbnail ? `/uploads/jobs/thumbnails/${thumbnail.filename}` : dto.thumbnailUrl;
    return this.jobs.update(user.userId, id, dto, { thumbnailUrl });
  }

  @RequirePermissions('JOB_VIEW')
  @Get()
  @ApiOperation({ summary: 'List own jobs' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'ACTIVE', 'CLOSED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.jobs.list(user.userId, status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }
}
