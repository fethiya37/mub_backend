import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { AccountSetupDto } from '../dto/account-setup.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Account')
@Public()
@Controller('api/account')
export class AccountController {
  constructor(private readonly auth: AuthService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Complete account setup (create password) using token' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  setup(@Body() dto: AccountSetupDto) {
    return this.auth.completeAccountSetup(dto);
  }
}
