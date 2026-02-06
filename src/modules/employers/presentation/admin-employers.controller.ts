import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { EmployersService } from '../services/employers.service';
import { EmployerApprovalService } from '../services/employer-approval.service';
import { AdminCreateEmployerDto } from '../dto/admin/admin-create-employer.dto';
import { AdminUpdateEmployerDto } from '../dto/admin/admin-update-employer.dto';
import { EmployerApproveDto } from '../dto/employer-approve.dto';
import { EmployerRejectDto } from '../dto/employer-reject.dto';
import { AdminListEmployersQueryDto } from '../dto/admin/admin-list-employers.query.dto';

import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function employerDiskStorage() {
  return diskStorage({
    destination: (_req, file, cb) => {
      const root = buildUploadsRoot();

      const subdir =
        file.fieldname === 'logo'
          ? 'logos'
          : file.fieldname === 'ownerIdFile'
            ? 'owners'
            : file.fieldname === 'licenseFile'
              ? 'licenses'
              : 'misc';

      const dest = join(root, 'employers', subdir);
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

@ApiTags('Admin Employers')
@ApiBearerAuth()
@Controller('api/admin/employers')
export class AdminEmployersController {
  constructor(
    private readonly employers: EmployersService,
    private readonly approval: EmployerApprovalService
  ) {}

  @RequirePermissions('EMPLOYER_VIEW')
  @Get()
  @ApiOperation({ summary: 'List employers' })
  list(@Query() q: AdminListEmployersQueryDto) {
    return this.employers.list({ status: q.status, country: q.country }, q.page ?? 1, q.pageSize ?? 50);
  }

  @RequirePermissions('EMPLOYER_VIEW')
  @Get(':id')
  @ApiOperation({ summary: 'Get employer details + approval history' })
  get(@Param('id') id: string) {
    return this.employers.get(id);
  }

  @RequirePermissions('EMPLOYER_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Admin creates employer (supports multipart files)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'ownerIdFile', maxCount: 1 },
        { name: 'licenseFile', maxCount: 1 }
      ],
      {
        limits: { fileSize: maxUploadBytes() },
        storage: employerDiskStorage()
      }
    )
  )
  async create(
    @Body() dto: AdminCreateEmployerDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      ownerIdFile?: Express.Multer.File[];
      licenseFile?: Express.Multer.File[];
    },
    @CurrentUserDecorator() user: CurrentUser
  ) {
    const resolved = await this.employers.resolveAdminCreateFiles(dto, {
      logoFile: files?.logo?.[0],
      ownerIdFile: files?.ownerIdFile?.[0],
      licenseFile: files?.licenseFile?.[0]
    });

    const employer = await this.employers.adminCreate(resolved, user.userId);
    if (dto.autoApprove) return this.approval.approve(employer.id, user.userId, 'Auto approved by admin');
    return employer;
  }

  @RequirePermissions('EMPLOYER_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Admin updates employer (supports multipart files)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'ownerIdFile', maxCount: 1 },
        { name: 'licenseFile', maxCount: 1 }
      ],
      {
        limits: { fileSize: maxUploadBytes() },
        storage: employerDiskStorage()
      }
    )
  )
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateEmployerDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      ownerIdFile?: Express.Multer.File[];
      licenseFile?: Express.Multer.File[];
    },
    @CurrentUserDecorator() user: CurrentUser
  ) {
    const resolved = await this.employers.resolveAdminUpdateFiles(id, dto, {
      logoFile: files?.logo?.[0],
      ownerIdFile: files?.ownerIdFile?.[0],
      licenseFile: files?.licenseFile?.[0]
    });

    return this.employers.adminUpdate(id, resolved, user.userId);
  }

  @RequirePermissions('EMPLOYER_APPROVE')
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve employer and send account setup email' })
  approve(@Param('id') id: string, @Body() dto: EmployerApproveDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.approval.approve(id, user.userId, dto.reason);
  }

  @RequirePermissions('EMPLOYER_APPROVE')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject employer' })
  reject(@Param('id') id: string, @Body() dto: EmployerRejectDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.approval.reject(id, user.userId, dto.reason);
  }
}
