import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { VisasService } from '../services/visas.service';
import { ApplicantListVisasQueryDto } from '../dto/applicant/applicant-list-visas.query.dto';

@ApiTags('Applicant Visas')
@ApiBearerAuth()
@Controller('api/applicant/visas')
export class ApplicantVisasController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW_SELF')
  @Get()
  @ApiOperation({ summary: 'List my visas (read-only)' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: ApplicantListVisasQueryDto) {
    return this.visas.applicantList(user.userId, q.status, q.page ? Number(q.page) : 1, q.pageSize ? Number(q.pageSize) : 50);
  }

  @RequirePermissions('VISA_VIEW_SELF')
  @Get(':visaId')
  @ApiOperation({ summary: 'Get my visa details (read-only)' })
  get(@CurrentUserDecorator() user: CurrentUser, @Param('visaId') visaId: string) {
    return this.visas.applicantGet(user.userId, visaId);
  }
}
