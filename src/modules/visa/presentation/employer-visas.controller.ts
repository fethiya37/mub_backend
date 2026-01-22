import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { VisasService } from '../services/visas.service';
import { EmployerListVisasQueryDto } from '../dto/employer/employer-list-visas.query.dto';

@ApiTags('Employer Visas')
@ApiBearerAuth()
@Controller('api/employer/visas')
export class EmployerVisasController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW')
  @Get()
  @ApiOperation({ summary: 'List visas for my applicants (read-only)' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: EmployerListVisasQueryDto) {
    return this.visas.employerList(
      user.userId,
      { status: q.status, applicantId: q.applicantId, jobId: q.jobId },
      q.page ? Number(q.page) : 1,
      q.pageSize ? Number(q.pageSize) : 50
    );
  }

  @RequirePermissions('VISA_VIEW')
  @Get(':visaId')
  @ApiOperation({ summary: 'Get visa details for my applicant (read-only)' })
  get(@CurrentUserDecorator() user: CurrentUser, @Param('visaId') visaId: string) {
    return this.visas.employerGet(user.userId, visaId);
  }
}