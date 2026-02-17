import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { VisaMedicalReportQueryDto } from '../dto/visa-medical.query.dto';
import { VisaMedicalReportService } from '../services/visa-medical-report.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
export class VisaMedicalReportController {
  constructor(private readonly svc: VisaMedicalReportService) {}

  @RequirePermissions('REPORT_VIEW')
  @Get('visa-medical')
  @ApiOperation({ summary: 'Visa & Medical Statistics report' })
  get(@Query() q: VisaMedicalReportQueryDto) {
    return this.svc.getReport(q);
  }
}
