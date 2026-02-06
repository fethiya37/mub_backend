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
import { ApplyJobDto } from '../dto/applicant/apply-job.dto';
import { UpdateCvDto } from '../dto/applicant/update-cv.dto';
import { WithdrawApplicationDto } from '../dto/applicant/withdraw-application.dto';
import { ListMyApplicationsQueryDto } from '../dto/applicant/list-my-applications.query.dto';

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

@ApiTags('Applicant Applications')
@ApiBearerAuth()
@Controller('api/applicant/job-applications')
export class ApplicantApplicationsController {
  constructor(private readonly applications: JobApplicationsService) {}

  @RequirePermissions('APPLICATION_CREATE')
  @Post()
  @ApiOperation({ summary: 'Apply (or reapply if REJECTED/WITHDRAWN) to a job' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: cvDiskStorage(),
      limits: { fileSize: maxUploadBytes() }
    })
  )
  apply(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: ApplyJobDto,
    @UploadedFile() cv?: Express.Multer.File
  ) {
    const cvFileUrl = cv ? `/uploads/job-applications/cv/${cv.filename}` : dto.cvFileUrl ?? null;
    return this.applications.applyAsApplicant(user.userId, { ...dto, cvFileUrl });
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Put(':id/cv')
  @ApiOperation({ summary: 'Update CV for own application (PENDING only)' })
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
    @Body() dto: UpdateCvDto,
    @UploadedFile() cv?: Express.Multer.File
  ) {
    const cvFileUrl = cv ? `/uploads/job-applications/cv/${cv.filename}` : dto.cvFileUrl ?? null;
    return this.applications.updateCvAsApplicant(user.userId, id, { ...dto, cvFileUrl });
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw own application (PENDING only)' })
  withdraw(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: WithdrawApplicationDto) {
    return this.applications.withdrawAsApplicant(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_VIEW_SELF')
  @Get()
  @ApiOperation({ summary: 'List my applications' })
  listMy(@CurrentUserDecorator() user: CurrentUser, @Query() q: ListMyApplicationsQueryDto) {
    return this.applications.listMyApplications(user.userId, q);
  }
}
