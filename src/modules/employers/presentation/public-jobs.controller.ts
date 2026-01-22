import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { PublicJobsService } from '../services/public-jobs.service';
import { PublicListJobsQueryDto } from '../dto/public/public-list-jobs.query.dto';

@ApiTags('Public Jobs')
@Public()
@Controller('api/public/jobs')
export class PublicJobsController {
  constructor(private readonly jobs: PublicJobsService) {}

  @Get()
  @ApiOperation({ summary: 'Public job list (default ACTIVE only)' })
  list(@Query() q: PublicListJobsQueryDto) {
    return this.jobs.list(
      { country: q.country, city: q.city, status: q.status },
      q.page ?? 1,
      q.pageSize ?? 20
    );
  }
}
