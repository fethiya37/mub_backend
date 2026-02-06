import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EmployersService } from '../services/employers.service';
import { EmployerSelfUpdateDto } from '../dto/employer/employer-self-update.dto';
import { EmployerAccessService } from '../services/employer-access.service';

@ApiTags('Employer Profile')
@ApiBearerAuth()
@Controller('api/employer')
export class EmployerProfileController {
  constructor(
    private readonly employers: EmployersService,
    private readonly access: EmployerAccessService
  ) {}

  @RequirePermissions('EMPLOYER_SELF_VIEW')
  @Get('profile')
  @ApiOperation({ summary: 'Get my employer profile' })
  async get(@CurrentUserDecorator() user: CurrentUser) {
    const employer = await this.access.getEmployerForUser(user.userId);
    return employer;
  }

  @RequirePermissions('EMPLOYER_SELF_UPDATE')
  @Put('profile')
  @ApiOperation({ summary: 'Update my employer profile' })
  update(@CurrentUserDecorator() user: CurrentUser, @Body() dto: EmployerSelfUpdateDto) {
    return this.employers.employerSelfUpdate(user.userId, dto);
  }
}
