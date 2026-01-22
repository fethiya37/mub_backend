import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CvTemplateService } from '../services/cv-template.service';
import { AdminCreateCvTemplateDto } from '../dto/admin/admin-create-cv-template.dto';
import { AdminUpdateCvTemplateDto } from '../dto/admin/admin-update-cv-template.dto';

@ApiTags('Admin CV Templates')
@ApiBearerAuth()
@Controller('api/admin/cv-templates')
export class AdminCvTemplatesController {
  constructor(private readonly templates: CvTemplateService) {}

  @RequirePermissions('SYSTEM_CONFIG_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create CV template' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateCvTemplateDto) {
    return this.templates.create(user.userId, dto);
  }

  @RequirePermissions('SYSTEM_CONFIG_MANAGE')
  @Get(':id')
  @ApiOperation({ summary: 'Get template' })
  get(@Param('id') id: string) {
    return this.templates.get(id);
  }

  @RequirePermissions('SYSTEM_CONFIG_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update CV template' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateCvTemplateDto) {
    return this.templates.update(id, dto);
  }

  @RequirePermissions('SYSTEM_CONFIG_MANAGE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete CV template' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  delete(@Param('id') id: string) {
    return this.templates.delete(id);
  }
}
