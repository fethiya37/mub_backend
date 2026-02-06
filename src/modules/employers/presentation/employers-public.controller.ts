import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { Public } from '../../../common/decorators/public.decorator';
import { EmployersService } from '../services/employers.service';
import { EmployerRegisterDto } from '../dto/employer-register.dto';

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

@ApiTags('Employers')
@Public()
@Controller('api/employers')
export class EmployersPublicController {
  constructor(private readonly employers: EmployersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Employer partnership request (PENDING) (supports multipart files)' })
  @ApiResponse({ status: 201 })
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
  async register(
    @Body() dto: EmployerRegisterDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      ownerIdFile?: Express.Multer.File[];
      licenseFile?: Express.Multer.File[];
    }
  ) {
    const resolved = await this.employers.resolveEmployerRegisterFiles(dto, {
      logoFile: files?.logo?.[0],
      ownerIdFile: files?.ownerIdFile?.[0],
      licenseFile: files?.licenseFile?.[0]
    });

    return this.employers.register(resolved);
  }
}
