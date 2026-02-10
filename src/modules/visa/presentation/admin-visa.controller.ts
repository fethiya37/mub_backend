import { Body, Controller, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { VisasService } from '../services/visas.service';
import { AdminCreateVisaCaseDto } from '../dto/admin/admin-create-visa-case.dto';
import { AdminListVisaCasesQueryDto } from '../dto/admin/admin-list-visa-cases.query.dto';
import { AdminAssignCaseManagerDto } from '../dto/admin/admin-assign-case-manager.dto';
import { AdminUpsertMedicalDto } from '../dto/admin/admin-upsert-medical.dto';
import { AdminUpsertInsuranceDto } from '../dto/admin/admin-upsert-insurance.dto';
import { AdminSetFingerprintDto } from '../dto/admin/admin-set-fingerprint.dto';
import { AdminUpsertEmbassyProcessDto } from '../dto/admin/admin-upsert-embassy-process.dto';
import { AdminUpsertLmisProcessDto } from '../dto/admin/admin-upsert-lmis-process.dto';
import { AdminCreateVisaAttemptDto } from '../dto/admin/admin-create-visa-attempt.dto';
import { AdminCreateFlightBookingDto } from '../dto/admin/admin-create-flight-booking.dto';
import { AdminCreateVisaReturnDto } from '../dto/admin/admin-create-visa-return.dto';
import { AdminCloseVisaCaseDto } from '../dto/admin/admin-close-visa-case.dto';

import { buildUploadsRoot, ensureDir, maxUploadBytes, safeExt } from '../../../common/utils/upload/upload.utils';

function visaDiskStorage() {
  return diskStorage({
    destination: (_req, file, cb) => {
      const root = buildUploadsRoot();

      const subdir =
        file.fieldname === 'reportFile'
          ? join('visa', 'medical')
          : file.fieldname === 'policyFile'
            ? join('visa', 'insurance')
            : join('visa', 'misc');

      const dest = join(root, subdir);
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

@ApiTags('Admin Visa')
@ApiBearerAuth()
@Controller('api/admin/visa')
export class AdminVisaController {
  constructor(private readonly visas: VisasService) { }

  @RequirePermissions('VISA_CREATE')
  @Post('cases')
  @ApiOperation({ summary: 'Create visa case (caseManagerUserId=auth user)' })
  createCase(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateVisaCaseDto) {
    return this.visas.adminCreateCase(user.userId, dto);
  }

  @RequirePermissions('VISA_VIEW')
  @Get('cases')
  @ApiOperation({ summary: 'Admin list visa cases' })
  listCases(@Query() q: AdminListVisaCasesQueryDto) {
    return this.visas.adminListCases(q);
  }

  @RequirePermissions('VISA_UPDATE')
  @Put('cases/:id/assign-manager')
  @ApiOperation({ summary: 'Assign case manager' })
  assignManager(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminAssignCaseManagerDto
  ) {
    return this.visas.adminAssignCaseManager(user.userId, id, dto);
  }

  @RequirePermissions('MEDICAL_UPLOAD_RESULT')
  @Post('medical')
  @ApiOperation({ summary: 'Upsert medical and set case status to MEDICAL' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'reportFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: visaDiskStorage()
    })
  )
  upsertMedical(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertMedicalDto,
    @UploadedFiles() files: { reportFile?: Express.Multer.File[] }
  ) {
    const reportFileUrl = files?.reportFile?.[0]
      ? `/uploads/visa/medical/${files.reportFile[0].filename}`
      : dto.reportFileUrl;

    return this.visas.adminUpsertMedical(user.userId, {
      ...dto,
      reportFileUrl: reportFileUrl ?? null
    });
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('insurance')
  @ApiOperation({ summary: 'Upsert insurance and set case status to INSURANCE' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'policyFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: visaDiskStorage()
    })
  )
  upsertInsurance(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertInsuranceDto,
    @UploadedFiles() files: { policyFile?: Express.Multer.File[] }
  ) {
    const policyFileUrl = files?.policyFile?.[0]
      ? `/uploads/visa/insurance/${files.policyFile[0].filename}`
      : dto.policyFileUrl;

    return this.visas.adminUpsertInsurance(user.userId, {
      ...dto,
      policyFileUrl: policyFileUrl ?? null
    });
  }

  @RequirePermissions('VISA_UPDATE')
  @Put('cases/:id/fingerprint')
  @ApiOperation({ summary: 'Upsert fingerprint and set case status to FINGERPRINT' })
  setFingerprint(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminSetFingerprintDto) {
    return this.visas.adminSetFingerprint(user.userId, id, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('embassy')
  @ApiOperation({ summary: 'Upsert embassy process and set case status to EMBASSY' })
  upsertEmbassy(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpsertEmbassyProcessDto) {
    return this.visas.adminUpsertEmbassy(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('lmis')
  @ApiOperation({ summary: 'Upsert LMIS and set case status to LMIS' })
  upsertLmis(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpsertLmisProcessDto) {
    return this.visas.adminUpsertLMIS(user.userId, dto);
  }

  @RequirePermissions('VISA_SUBMIT')
  @Post('attempts')
  @ApiOperation({ summary: 'Create visa attempt (attemptNumber generated) and set case status to VISA' })
  createAttempt(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateVisaAttemptDto) {
    return this.visas.adminCreateAttempt(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('flights')
  @ApiOperation({ summary: 'Create flight booking and set case status to FLIGHT_BOOKED' })
  createFlight(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateFlightBookingDto) {
    return this.visas.adminCreateFlight(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('returns')
  @ApiOperation({ summary: 'Create return record and set case status to RETURNED' })
  createReturn(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateVisaReturnDto) {
    return this.visas.adminCreateReturn(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('cases/:id/deploy')
  @ApiOperation({ summary: 'Manually set visa case status to DEPLOYED' })
  deployCase(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    return this.visas.adminMarkDeployed(user.userId, id);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('cases/:id/close')
  @ApiOperation({ summary: 'Close case (isActive=false) and set status to CLOSED' })
  closeCase(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminCloseVisaCaseDto) {
    return this.visas.adminCloseCase(user.userId, id, dto);
  }
}
