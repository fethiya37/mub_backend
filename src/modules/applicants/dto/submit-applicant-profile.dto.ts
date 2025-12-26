import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SubmitApplicantProfileDto {
  @ApiProperty({ example: 'SUBMITTED', enum: ['SUBMITTED'] })
  @IsIn(['SUBMITTED'])
  status!: 'SUBMITTED';
}
