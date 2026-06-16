import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EmployersService } from '../services/employers.service';

@ApiTags('Employer Profile')
@ApiBearerAuth()
@Controller('api/employer/profile')
export class EmployerProfileSelfController {
  constructor(private readonly employers: EmployersService) {}

  @RequirePermissions('EMPLOYER_SELF_VIEW')
  @Get()
  @ApiOperation({ summary: 'Get my employer profile' })
  async getMyProfile(@CurrentUserDecorator() user: CurrentUser) {
    const employer = await this.employers.getEmployerByUserId(user.userId);
    return {
      id: employer.id,
      organizationName: employer.organizationName,
      country: employer.country,
      contactEmail: employer.contactEmail,
      contactPhone: employer.contactPhone,
      userId: employer.userId,
    };
  }
}
