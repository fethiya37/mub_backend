import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { SkillsService } from '../services/skills.service';
import { CreateSkillDto } from '../dto/skills/create-skill.dto';
import { UpdateSkillDto } from '../dto/skills/update-skill.dto';

@ApiTags('Admin Skills')
@ApiBearerAuth()
@Controller('api/admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @RequirePermissions('SKILL_VIEW')
  @Get()
  @ApiOperation({ summary: 'List skills' })
  list() {
    return this.skills.list();
  }

  @RequirePermissions('SKILL_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create skill' })
  create(@Body() dto: CreateSkillDto) {
    return this.skills.create(dto.name);
  }

  @RequirePermissions('SKILL_UPDATE')
  @Put(':skillId')
  @ApiOperation({ summary: 'Update skill' })
  update(@Param('skillId') skillId: string, @Body() dto: UpdateSkillDto) {
    return this.skills.update(skillId, { name: dto.name });
  }
}
