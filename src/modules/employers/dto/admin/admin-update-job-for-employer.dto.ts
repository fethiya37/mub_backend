import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UpdateJobDto } from '../update-job.dto';

export class AdminUpdateJobForEmployerDto extends UpdateJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  employerId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  jobId!: string;
}
