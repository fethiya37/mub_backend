import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ApplicantsBySourceQueryDto } from '../dto/applicants-by-source.query.dto';
import { ApplicantsBySourceService } from '../services/applicants-by-source.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports/applicants-by-source')
export class ApplicantsBySourceController {
  constructor(private readonly report: ApplicantsBySourceService) {}

  @RequirePermissions('REPORT_VIEW')
  @Get('count')
  @ApiOperation({ summary: 'Count applicants by source (SELF | AGENCY | MUB_STAFF)' })
  count(@Query() q: ApplicantsBySourceQueryDto) {
    return this.report.count(q);
  }

  @RequirePermissions('REPORT_VIEW')
  @Get('creators')
  @ApiOperation({ summary: 'Creator breakdown for a source with creator user names' })
  creators(@Query() q: ApplicantsBySourceQueryDto) {
    return this.report.creators(q);
  }

  @RequirePermissions('REPORT_VIEW')
  @Get('list')
  @ApiOperation({ summary: 'Drill-down list for a source (optional export)' })
  async list(@Query() q: ApplicantsBySourceQueryDto, @Res() res: Response) {
    if (q.export === 'excel') {
      await this.report.streamExcel(q, res);
      return;
    }

    if (q.export === 'pdf') {
      await this.report.streamPdf(q, res);
      return;
    }

    const data = await this.report.list(q);
    res.json(data);
  }
}
