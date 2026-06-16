import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { EmployersService } from '../services/employers.service';

@ApiTags('Public Partners')
@Public()
@Controller('api/public/partners')
export class PublicPartnersController {
  constructor(private readonly employers: EmployersService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries that have approved partners' })
  async getCountries() {
    return this.employers.getPartnerCountries();
  }

  @Get()
  @ApiOperation({ summary: 'Get available partners by country' })
  @ApiQuery({ name: 'country', required: false })
  async getPartners(@Query('country') country?: string) {
    return this.employers.getAvailablePartners(country);
  }
}
