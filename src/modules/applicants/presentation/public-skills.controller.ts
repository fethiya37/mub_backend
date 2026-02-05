import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { SkillsService } from '../services/skills.service';

@ApiTags('Public Skills')
@Public()
@Controller('api/public/skills')
export class PublicSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'List skills' })
  list() {
    return this.skills.list();
  }
}
