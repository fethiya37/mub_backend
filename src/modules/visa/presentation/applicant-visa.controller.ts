import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { VisasService } from '../services/visas.service';
import { ApplicantListVisaCasesQueryDto } from '../dto/applicant/applicant-list-visa-cases.query.dto';

@ApiTags('Applicant Visa')
@ApiBearerAuth()
@Controller('api/applicant/visa')
export class ApplicantVisaController {
  constructor(private readonly visas: VisasService) {}

  @RequirePermissions('VISA_VIEW_SELF')
  @Get('cases')
  @ApiOperation({ summary: 'List my visa cases' })
  listMy(@CurrentUserDecorator() user: CurrentUser, @Query() q: ApplicantListVisaCasesQueryDto) {
    return this.visas.applicantListCases(user.userId, q);
  }
}
