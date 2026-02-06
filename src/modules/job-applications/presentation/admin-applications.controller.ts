import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { JobApplicationsService } from '../services/job-applications.service';
import { AdminCreateApplicationDto } from '../dto/admin/admin-create-application.dto';
import { AdminListApplicationsQueryDto } from '../dto/admin/admin-list-applications.query.dto';
import { AdminApproveApplicationDto } from '../dto/admin/admin-approve-application.dto';
import { AdminRejectApplicationDto } from '../dto/admin/admin-reject-application.dto';
import { AdminUpdateCvDto } from '../dto/admin/admin-update-cv.dto';

import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function cvDiskStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const root = buildUploadsRoot();
      const dest = join(root, 'job-applications', 'cv');
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

@ApiTags('Admin Applications')
@ApiBearerAuth()
@Controller('api/admin/job-applications')
export class AdminApplicationsController {
  constructor(private readonly applications: JobApplicationsService) {}

  @RequirePermissions('APPLICATION_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create (or reapply) on behalf of applicant' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: cvDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateApplicationDto,
    @UploadedFile() cv?: Express.Multer.File
  ) {
    const cvFileUrl = cv ? `/uploads/job-applications/cv/${cv.filename}` : dto.cvFileUrl ?? null;
    return this.applications.createAsAdmin(user.userId, { ...dto, cvFileUrl });
  }

  @RequirePermissions('APPLICATION_VIEW')
  @Get()
  @ApiOperation({ summary: 'Admin list applications' })
  list(@Query() q: AdminListApplicationsQueryDto) {
    return this.applications.listAdminApplications(q);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Put(':id/cv')
  @ApiOperation({ summary: 'Update CV on behalf (PENDING only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: cvDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  updateCv(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateCvDto,
    @UploadedFile() cv?: Express.Multer.File
  ) {
    const cvFileUrl = cv ? `/uploads/job-applications/cv/${cv.filename}` : dto.cvFileUrl ?? null;
    return this.applications.updateCvAsAdmin(user.userId, id, { ...dto, cvFileUrl });
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/approve')
  @ApiOperation({ summary: 'Admin approve (PENDING -> APPROVED)' })
  approve(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminApproveApplicationDto) {
    return this.applications.approveAsAdmin(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Admin reject (PENDING -> REJECTED)' })
  reject(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminRejectApplicationDto) {
    return this.applications.rejectAsAdmin(user.userId, id, dto);
  }
}
