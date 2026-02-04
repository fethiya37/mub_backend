import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateVisaCaseDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  applicantId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  partnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  jobId?: string;

  @ApiProperty({ example: 'Saudi Arabia' })
  @IsString()
  @MinLength(2)
  destinationCountry!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  sponsorId?: string;
}
