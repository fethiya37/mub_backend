import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SelfUpdateLocalAgencyDto } from '../dto/self/self-update-local-agency.dto';
import { LocalAgencyAccessService } from '../services/local-agency-access.service';
import { LocalAgencyRepository } from '../repositories/local-agency.repository';

@ApiTags('Local Agency')
@ApiBearerAuth()
@Controller('api/local-agency')
export class SelfLocalAgencyController {
  constructor(
    private readonly access: LocalAgencyAccessService,
    private readonly agencies: LocalAgencyRepository
  ) {}

  @RequirePermissions('LOCAL_AGENCY_SELF_VIEW')
  @Get('me')
  @ApiOperation({ summary: 'Get my local agency (APPROVED only)' })
  get(@CurrentUserDecorator() user: CurrentUser) {
    return this.access.getAgencyForUser(user.userId);
  }

  @RequirePermissions('LOCAL_AGENCY_SELF_UPDATE')
  @Put('me')
  @ApiOperation({ summary: 'Update my local agency (limited fields, APPROVED only)' })
  async update(@CurrentUserDecorator() user: CurrentUser, @Body() dto: SelfUpdateLocalAgencyDto) {
    const agency = await this.access.getAgencyForUser(user.userId);

    const patch: any = {
      name: dto.name ?? undefined,
      contactPerson: dto.contactPerson ?? undefined,
      phone: dto.phone ?? undefined,
      email: dto.email ?? undefined
    };

    return this.agencies.update(agency.id, patch);
  }
}
