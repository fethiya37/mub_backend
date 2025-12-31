import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { EmployersService } from '../services/employers.service';
import { EmployerRegisterDto } from '../dto/employer-register.dto';

@ApiTags('Employers')
@Public()
@Controller('api/employers')
export class EmployersPublicController {
  constructor(private readonly employers: EmployersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Employer partnership request (PENDING)' })
  @ApiResponse({ status: 201 })
  register(@Body() dto: EmployerRegisterDto) {
    return this.employers.register(dto);
  }
}
