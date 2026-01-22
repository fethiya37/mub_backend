import { BadRequestException, Injectable } from '@nestjs/common';
import { CV_STATUS } from '../dto/shared/cv.enums.dto';

@Injectable()
export class CvStatusService {
  ensureEditable(status: string) {
    if (status !== CV_STATUS.draft) throw new BadRequestException('CV is not editable');
  }

  ensureSubmittable(status: string) {
    if (status !== CV_STATUS.draft) throw new BadRequestException('Only draft CV can be submitted');
  }

  ensureAdminCanReview(status: string) {
    if (status !== CV_STATUS.submitted) throw new BadRequestException('Only submitted CV can be reviewed');
  }
}
