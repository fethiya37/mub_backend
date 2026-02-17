import { Controller, Get, Param, Query, Res } from '@nestjs/common';
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
  @Get(':source/count')
  @ApiOperation({ summary: 'Count applicants by a single source (agency | self | mub-staff)' })
  count(@Param('source') source: string, @Query() q: ApplicantsBySourceQueryDto) {
    return this.report.count(source, q);
  }

  @RequirePermissions('REPORT_VIEW')
  @Get(':source/creators')
  @ApiOperation({ summary: 'Creator breakdown for a source with creator user names' })
  creators(@Param('source') source: string, @Query() q: ApplicantsBySourceQueryDto) {
    return this.report.creators(source, q);
  }

  @RequirePermissions('REPORT_VIEW')
  @Get(':source/list')
  @ApiOperation({ summary: 'Drill-down list for a source (createdBy, optional export)' })
  async list(@Param('source') source: string, @Query() q: ApplicantsBySourceQueryDto, @Res() res: Response) {
    if (q.export === 'excel') {
      await this.report.streamExcel(source, q, res);
      return;
    }

    if (q.export === 'pdf') {
      await this.report.streamPdf(source, q, res);
      return;
    }

    const data = await this.report.list(source, q);
    res.json(data);
  }
}
