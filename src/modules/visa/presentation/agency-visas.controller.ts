import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { VisasService } from '../services/visas.service';
import { AgencyListVisasQueryDto } from '../dto/agency/agency-list-visas.query.dto';

@ApiTags('Agency Visas')
@ApiBearerAuth()
@Controller('api/agency/visas')
export class AgencyVisasController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW')
  @Get()
  @ApiOperation({ summary: 'List visas for my created applicants (read-only)' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: AgencyListVisasQueryDto) {
    return this.visas.agencyList(
      user.userId,
      { status: q.status, applicantId: q.applicantId },
      q.page ? Number(q.page) : 1,
      q.pageSize ? Number(q.pageSize) : 50
    );
  }

  @RequirePermissions('VISA_VIEW')
  @Get(':visaId')
  @ApiOperation({ summary: 'Get visa details for my created applicant (read-only)' })
  get(@CurrentUserDecorator() user: CurrentUser, @Param('visaId') visaId: string) {
    return this.visas.agencyGet(user.userId, visaId);
  }
}
