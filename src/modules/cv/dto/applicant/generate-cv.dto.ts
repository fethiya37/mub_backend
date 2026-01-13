import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateCvDto {
  @ApiProperty({ required: false, description: 'If provided, forces regeneration for this cvId' })
  @IsOptional()
  @IsString()
  cvId?: string;

  @ApiProperty({ required: false, description: 'Optional job id (if cvId not provided)' })
  @IsOptional()
  @IsString()
  jobId?: string;
}
