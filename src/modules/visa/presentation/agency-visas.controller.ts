import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AgencyListVisaCasesQueryDto } from '../dto/agency/agency-list-visa-cases.query.dto';
import { VisasService } from '../services/visas.service';

@ApiTags('Agency Visa')
@ApiBearerAuth()
@Controller('api/agency/visa')
export class AgencyVisasController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW')
  @Get('cases')
  @ApiOperation({ summary: 'List visa cases (agency view)' })
  list(@Query() q: AgencyListVisaCasesQueryDto) {
    return this.visas.adminListCases({
      status: q.status,
      isActive: q.isActive,
      page: q.page,
      pageSize: q.pageSize
    });
  }
}
