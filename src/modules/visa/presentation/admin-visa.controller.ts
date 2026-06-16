import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
import { AdminUpdateFlightBookingDto } from '../dto/admin/admin-update-flight-booking.dto';
import { AdminCreateVisaReturnDto } from '../dto/admin/admin-create-visa-return.dto';
import { AdminCloseVisaCaseDto } from '../dto/admin/admin-close-visa-case.dto';

import {
  buildUploadsRoot,
  ensureDir,
  maxUploadBytes,
  safeExt,
} from '../../../common/utils/upload/upload.utils';
import { AdminBookFlightTicketDto } from '../dto/admin/admin-book-flight-ticket.dto';

function visaDiskStorage() {
  return diskStorage({
    destination: (_req, file, cb) => {
      const root = buildUploadsRoot();

      const subdir =
        file.fieldname === 'reportFile'
          ? join('visa', 'medical')
          : file.fieldname === 'policyFile'
            ? join('visa', 'insurance')
            : file.fieldname === 'ticketFile'
              ? join('visa', 'tickets')
              : join('visa', 'misc');

      const dest = join(root, subdir);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = safeExt(file.originalname);
      const name = crypto.randomBytes(16).toString('hex');
      cb(null, `${name}${ext}`);
    },
  });
}

@ApiTags('Admin Visa')
@ApiBearerAuth()
@Controller('api/admin/visa')
export class AdminVisaController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_CREATE')
  @Post('cases')
  @ApiOperation({ summary: 'Create visa case' })
  createCase(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateVisaCaseDto,
  ) {
    return this.visas.adminCreateCase(user.userId, dto);
  }

  @RequirePermissions('VISA_VIEW')
  @Get('cases')
  @ApiOperation({ summary: 'Admin list visa cases' })
  listCases(@Query() q: AdminListVisaCasesQueryDto) {
    return this.visas.adminListCases(q);
  }

  @RequirePermissions('VISA_VIEW')
  @Get('cases/:id')
  @ApiOperation({ summary: 'Get visa case by ID' })
  getVisaCaseById(@Param('id') id: string) {
    return this.visas.adminGetVisaCaseById(id);
  }

  @RequirePermissions('VISA_UPDATE')
  @Put('cases/:id/assign-manager')
  @ApiOperation({ summary: 'Assign case manager' })
  assignManager(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminAssignCaseManagerDto,
  ) {
    return this.visas.adminAssignCaseManager(user.userId, id, dto);
  }

  @RequirePermissions('MEDICAL_UPLOAD_RESULT')
  @Post('medical')
  @ApiOperation({ summary: 'Upsert medical' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'reportFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: visaDiskStorage(),
    }),
  )
  upsertMedical(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertMedicalDto,
    @UploadedFiles() files: { reportFile?: Express.Multer.File[] },
  ) {
    const reportFileUrl = files?.reportFile?.[0]
      ? `/uploads/visa/medical/${files.reportFile[0].filename}`
      : dto.reportFileUrl;

    return this.visas.adminUpsertMedical(user.userId, {
      ...dto,
      reportFileUrl: reportFileUrl ?? null,
    });
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('insurance')
  @ApiOperation({ summary: 'Upsert insurance' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'policyFile', maxCount: 1 }], {
      limits: { fileSize: maxUploadBytes() },
      storage: visaDiskStorage(),
    }),
  )
  upsertInsurance(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertInsuranceDto,
    @UploadedFiles() files: { policyFile?: Express.Multer.File[] },
  ) {
    const policyFileUrl = files?.policyFile?.[0]
      ? `/uploads/visa/insurance/${files.policyFile[0].filename}`
      : dto.policyFileUrl;

    return this.visas.adminUpsertInsurance(user.userId, {
      ...dto,
      policyFileUrl: policyFileUrl ?? null,
    });
  }

  @RequirePermissions('VISA_UPDATE')
  @Put('cases/:id/fingerprint')
  @ApiOperation({ summary: 'Set fingerprint' })
  setFingerprint(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminSetFingerprintDto,
  ) {
    return this.visas.adminSetFingerprint(user.userId, id, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('embassy')
  @ApiOperation({ summary: 'Upsert embassy process' })
  upsertEmbassy(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertEmbassyProcessDto,
  ) {
    return this.visas.adminUpsertEmbassy(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('lmis')
  @ApiOperation({ summary: 'Upsert LMIS' })
  upsertLmis(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminUpsertLmisProcessDto,
  ) {
    return this.visas.adminUpsertLMIS(user.userId, dto);
  }

  @RequirePermissions('VISA_SUBMIT')
  @Post('attempts')
  @ApiOperation({ summary: 'Create visa attempt' })
  createAttempt(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateVisaAttemptDto,
  ) {
    return this.visas.adminCreateAttempt(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Get('flights')
  @ApiOperation({ summary: 'List flight bookings' })
  @ApiQuery({ name: 'visaCaseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'pnr', required: false })
  @ApiQuery({ name: 'ticketNumber', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  listFlightBookings(
    @Query('visaCaseId') visaCaseId?: string,
    @Query('status') status?: string,
    @Query('pnr') pnr?: string,
    @Query('ticketNumber') ticketNumber?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? Math.min(parseInt(pageSize, 10), 100) : 20;
    return this.visas.adminListFlightBookings(
      { visaCaseId, status, pnr, ticketNumber },
      pageNum,
      pageSizeNum,
    );
  }

  @RequirePermissions('VISA_VIEW')
  @Get('flights/:id')
  @ApiOperation({ summary: 'Get flight booking by ID' })
  getFlightBooking(@Param('id') id: string) {
    return this.visas.adminGetFlightBooking(id);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('flights')
  @ApiOperation({
    summary: 'Create flight booking (status PENDING)',
  })
  createFlight(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateFlightBookingDto,
  ) {
    return this.visas.adminCreateFlight(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Put('flights/:id')
  @ApiOperation({ summary: 'Update flight booking' })
  updateFlightBooking(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateFlightBookingDto,
  ) {
    return this.visas.adminUpdateFlightBooking(user.userId, id, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('flights/:id/approve')
  @ApiOperation({
    summary: 'Manager approves flight booking (status -> APPROVED)',
  })
  approveFlightBooking(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() _body: any,
  ) {
    return this.visas.adminApproveFlightBooking(user.userId, id);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('flights/:id/book')
  @ApiOperation({ summary: 'Book ticket and upload (status -> BOOKED)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('ticketFile', {
      storage: visaDiskStorage(),
      limits: { fileSize: maxUploadBytes() },
    }),
  )
  bookFlightTicket(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminBookFlightTicketDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const ticketFileUrl = file
      ? `/uploads/visa/tickets/${file.filename}`
      : null;
    return this.visas.adminBookFlightTicket(
      user.userId,
      id,
      dto,
      ticketFileUrl,
    );
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('returns')
  @ApiOperation({ summary: 'Create return record' })
  createReturn(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: AdminCreateVisaReturnDto,
  ) {
    return this.visas.adminCreateReturn(user.userId, dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('cases/:id/deploy')
  @ApiOperation({ summary: 'Mark as deployed' })
  deployCase(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.visas.adminMarkDeployed(user.userId, id);
  }

  @RequirePermissions('VISA_UPDATE')
  @Post('cases/:id/close')
  @ApiOperation({ summary: 'Close case' })
  closeCase(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminCloseVisaCaseDto,
  ) {
    return this.visas.adminCloseCase(user.userId, id, dto);
  }
}
