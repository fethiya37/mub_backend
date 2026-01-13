import { ApiProperty } from '@nestjs/swagger';
import { CvVersionResponseDto } from './cv-version.response.dto';

export class CvResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty({ required: false })
  jobId?: string | null;

  @ApiProperty()
  cvTemplateId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currentVersion!: number;

  @ApiProperty({ required: false })
  submittedAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ required: false, type: [CvVersionResponseDto] })
  versions?: CvVersionResponseDto[];
}
