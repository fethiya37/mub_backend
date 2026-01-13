// src/modules/cv/presentation/cv-templates.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CvTemplateService } from '../services/cv-template.service';

@ApiTags('CV Templates')
@Public()
@Controller('api/cv-templates')
export class CvTemplatesController {
  constructor(private readonly templates: CvTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List active CV templates' })
  list() {
    return this.templates.listActive();
  }
}
