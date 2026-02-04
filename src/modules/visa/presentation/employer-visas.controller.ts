import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { VisasService } from '../services/visas.service';
import { EmployerListVisaCasesQueryDto } from '../dto/employer/employer-list-visa-cases.query.dto';

@ApiTags('Employer Visa')
@ApiBearerAuth()
@Controller('api/employer/visa')
export class EmployerVisasController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW')
  @Get('cases')
  @ApiOperation({ summary: 'List visa cases for my employer jobs' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: EmployerListVisaCasesQueryDto) {
    return this.visas.employerListCases(user.userId, q);
  }
}
