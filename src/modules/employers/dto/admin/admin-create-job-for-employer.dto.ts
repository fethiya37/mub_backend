import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { CreateJobDto } from '../create-job.dto';

export class AdminCreateJobForEmployerDto extends CreateJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  employerId!: string;
}
