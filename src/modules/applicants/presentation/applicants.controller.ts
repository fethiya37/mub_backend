import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Applicants')
@ApiBearerAuth()
@Controller('api/applicants')
export class ApplicantsController {
  @Get('me')
  me(@CurrentUserDecorator() user: CurrentUser) {
    return user;
  }
}
