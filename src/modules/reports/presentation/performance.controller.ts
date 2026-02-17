import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PerformanceReportQueryDto } from '../dto/performance.query.dto';
import { PerformanceReportService } from '../services/performance.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
export class PerformanceReportController {
  constructor(private readonly perf: PerformanceReportService) {}

  @RequirePermissions('REPORT_VIEW')
  @Get('performance')
  @ApiOperation({ summary: 'Agency & Staff Performance report' })
  get(@Query() q: PerformanceReportQueryDto) {
    return this.perf.getPerformance(q);
  }
}
