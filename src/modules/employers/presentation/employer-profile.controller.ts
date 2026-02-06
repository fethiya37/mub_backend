import { Body, Controller, Get, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { EmployersService } from '../services/employers.service';
import { EmployerSelfUpdateDto } from '../dto/employer/employer-self-update.dto';
import { EmployerAccessService } from '../services/employer-access.service';

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

@ApiTags('Employer Profile')
@ApiBearerAuth()
@Controller('api/employer')
export class EmployerProfileController {
  constructor(
    private readonly employers: EmployersService,
    private readonly access: EmployerAccessService
  ) {}

  @RequirePermissions('EMPLOYER_SELF_VIEW')
  @Get('profile')
  @ApiOperation({ summary: 'Get my employer profile' })
  async get(@CurrentUserDecorator() user: CurrentUser) {
    return this.access.getEmployerForUser(user.userId);
  }

  @RequirePermissions('EMPLOYER_SELF_UPDATE')
  @Put('profile')
  @ApiOperation({ summary: 'Update my employer profile (supports multipart files)' })
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
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: EmployerSelfUpdateDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      ownerIdFile?: Express.Multer.File[];
      licenseFile?: Express.Multer.File[];
    }
  ) {
    const resolved = await this.employers.resolveEmployerSelfUpdateFiles(user.userId, dto, {
      logoFile: files?.logo?.[0],
      ownerIdFile: files?.ownerIdFile?.[0],
      licenseFile: files?.licenseFile?.[0]
    });

    return this.employers.employerSelfUpdate(user.userId, resolved);
  }
}
