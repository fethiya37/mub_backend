import { Injectable } from '@nestjs/common';
import { JobPostingRepository } from '../repositories/job-posting.repository';

@Injectable()
export class PublicJobsService {
  constructor(private readonly jobs: JobPostingRepository) {}

  list(filters: { country?: string; city?: string; status?: string }, page: number, pageSize: number) {
    return this.jobs.listPublic(
      {
        country: filters.country,
        city: filters.city,
        status: filters.status ?? 'ACTIVE'
      },
      page,
      pageSize
    );
  }
}
