import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class ApplicantWorkExperienceDto {
  @ApiProperty({ example: 'Construction Electrician' })
  @IsString()
  @MinLength(2)
  jobTitle!: string;

  @ApiPropertyOptional({ example: 'ABC Construction PLC' })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiPropertyOptional({ example: 'Qatar' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '2019-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Installed and maintained electrical systems; performed troubleshooting; ensured compliance with safety rules.' })
  @IsOptional()
  @IsString()
  responsibilities?: string;
}
