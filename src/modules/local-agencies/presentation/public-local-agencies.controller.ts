import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { RegisterLocalAgencyDto } from '../dto/public/register-local-agency.dto';
import { LocalAgenciesService } from '../services/local-agencies.service';

@ApiTags('Public Local Agencies')
@Public()
@Controller('api/public/local-agencies')
export class PublicLocalAgenciesController {
  constructor(private readonly agencies: LocalAgenciesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a local agency (creates PENDING record, no user yet)' })
  @ApiResponse({
    status: 201,
    schema: { example: { id: '9f8f3b2d-0b7d-4b7a-a8d0-6c9d3d5e0c11', status: 'PENDING' } }
  })
  register(@Body() dto: RegisterLocalAgencyDto) {
    return this.agencies.register(dto);
  }
}
