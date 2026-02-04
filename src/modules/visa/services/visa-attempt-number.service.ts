import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VisaAttemptNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async nextAttemptNumber(visaCaseId: string) {
    const r = await this.prisma.visaAttempt.aggregate({
      where: { visaCaseId },
      _max: { attemptNumber: true }
    });

    return (r._max.attemptNumber ?? 0) + 1;
  }
}
