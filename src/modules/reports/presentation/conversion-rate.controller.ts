import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ConversionRateQueryDto } from '../dto/conversion-rate.query.dto';
import { ConversionRateService } from '../services/conversion-rate.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
export class ConversionRateController {
  constructor(private readonly service: ConversionRateService) {}

  @RequirePermissions('REPORT_VIEW')
  @Get('conversion-rate')
  @ApiOperation({ summary: 'Conversion Rate report (Applied -> Medical Passed -> Visa Issued -> Deployed)' })
  get(@Query() q: ConversionRateQueryDto) {
    return this.service.getConversionRate(q);
  }
}
