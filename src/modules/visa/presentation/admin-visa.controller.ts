import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { VisasService } from '../services/visas.service';
import { VisaDocumentsService } from '../services/visa-documents.service';
import { VisaComplianceService } from '../services/visa-compliance.service';
import { AdminCreateVisaApplicationDto } from '../dto/admin/admin-create-visa-application.dto';
import { AdminUpdateVisaApplicationDto } from '../dto/admin/admin-update-visa-application.dto';
import { AdminListVisasQueryDto } from '../dto/admin/admin-list-visas.query.dto';
import { AdminSubmitVisaDto } from '../dto/admin/admin-submit-visa.dto';
import { AdminUpdateVisaStatusDto } from '../dto/admin/admin-update-visa-status.dto';
import { AdminRecordVisaDecisionDto } from '../dto/admin/admin-record-visa-decision.dto';
import { AdminUploadVisaDocumentDto } from '../dto/admin/admin-upload-visa-document.dto';
import { AdminVerifyVisaDocumentDto } from '../dto/admin/admin-verify-visa-document.dto';
import { AdminAddComplianceCheckDto } from '../dto/admin/admin-add-compliance-check.dto';
import { AdminUpdateComplianceCheckDto } from '../dto/admin/admin-update-compliance-check.dto';

@ApiTags('Admin Visas')
@ApiBearerAuth()
@Controller('api/admin/visas')
export class AdminVisaController {
  constructor(
    private readonly visas: VisasService,
    private readonly docs: VisaDocumentsService,
    private readonly compliance: VisaComplianceService
  ) {}

  @RequirePermissions('VISA_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create visa application (DRAFT)' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateVisaApplicationDto) {
    return this.visas.createDraft(user.userId, dto);
  }

  @RequirePermissions('VISA_VIEW_ALL')
  @Get()
  @ApiOperation({ summary: 'List visas with filters (paged)' })
  @ApiQuery({ name: 'status', required: false })
  list(@Query() q: AdminListVisasQueryDto) {
    return this.visas.list(
      {
        status: q.status,
        applicantId: q.applicantId,
        employerId: q.employerId,
        jobId: q.jobId,
        destinationCountry: q.destinationCountry,
        visaType: q.visaType
      },
      q.page ? Number(q.page) : 1,
      q.pageSize ? Number(q.pageSize) : 50
    );
  }

  @RequirePermissions('VISA_VIEW_ALL')
  @Get(':visaId')
  @ApiOperation({ summary: 'Get visa application details' })
  get(@Param('visaId') visaId: string) {
    return this.visas.get(visaId);
  }

  @RequirePermissions('VISA_UPDATE')
  @Put(':visaId')
  @ApiOperation({ summary: 'Update visa (DRAFT only)' })
  update(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpdateVisaApplicationDto) {
    return this.visas.updateDraft(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_SUBMIT')
  @Post(':visaId/submit')
  @ApiOperation({ summary: 'Submit visa (DRAFT -> SUBMITTED) after document + compliance validation' })
  submit(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminSubmitVisaDto) {
    return this.visas.submit(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_STATUS_UPDATE')
  @Patch(':visaId/status')
  @ApiOperation({ summary: 'Update visa status (state machine enforced)' })
  updateStatus(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpdateVisaStatusDto) {
    return this.visas.updateStatus(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_DECIDE')
  @Patch(':visaId/decision')
  @ApiOperation({ summary: 'Record decision (approve/reject)' })
  recordDecision(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminRecordVisaDecisionDto) {
    return this.visas.recordDecision(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_DOCUMENT_UPLOAD')
  @Post(':visaId/documents')
  @ApiOperation({ summary: 'Upload visa document (creates new version, deactivates previous)' })
  uploadDoc(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUploadVisaDocumentDto) {
    return this.docs.upload(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_DOCUMENT_VERIFY')
  @Patch('documents/:documentId/verify')
  @ApiOperation({ summary: 'Verify or reject a visa document' })
  verifyDoc(@Param('documentId') documentId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminVerifyVisaDocumentDto) {
    return this.docs.verify(documentId, user.userId, dto);
  }

  @RequirePermissions('VISA_COMPLIANCE_CHECK')
  @Post(':visaId/compliance')
  @ApiOperation({ summary: 'Add compliance requirement/check entry' })
  addCompliance(@Param('visaId') visaId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminAddComplianceCheckDto) {
    return this.compliance.add(visaId, user.userId, dto);
  }

  @RequirePermissions('VISA_COMPLIANCE_CHECK')
  @Patch('compliance/:checkId')
  @ApiOperation({ summary: 'Update compliance requirement status' })
  updateCompliance(@Param('checkId') checkId: string, @CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpdateComplianceCheckDto) {
    return this.compliance.update(checkId, user.userId, dto);
  }

  @RequirePermissions('VISA_VIEW_ALL')
  @Get(':visaId/documents')
  @ApiOperation({ summary: 'List visa documents' })
  listDocs(@Param('visaId') visaId: string) {
    return this.docs.list(visaId);
  }

  @RequirePermissions('VISA_VIEW_ALL')
  @Get(':visaId/compliance')
  @ApiOperation({ summary: 'List compliance checks' })
  listCompliance(@Param('visaId') visaId: string) {
    return this.compliance.listByVisa(visaId);
  }
}
