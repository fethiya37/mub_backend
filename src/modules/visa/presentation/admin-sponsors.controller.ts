import { Body, Controller, Post, Put, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { SponsorsService } from '../services/sponsors.service';
import { AdminUpsertSponsorDto } from '../dto/admin/admin-upsert-sponsor.dto';

@ApiTags('Admin Sponsors')
@ApiBearerAuth()
@Controller('api/admin/visa/sponsors')
export class AdminSponsorsController {
  constructor(private readonly sponsors: SponsorsService) {}

  @RequirePermissions('VISA_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create sponsor' })
  create(@Body() dto: AdminUpsertSponsorDto) {
    return this.sponsors.create(dto);
  }

  @RequirePermissions('VISA_UPDATE')
  @Put(':id')
  @ApiOperation({ summary: 'Update sponsor' })
  update(@Param('id') id: string, @Body() dto: AdminUpsertSponsorDto) {
    return this.sponsors.update(id, dto);
  }
}
