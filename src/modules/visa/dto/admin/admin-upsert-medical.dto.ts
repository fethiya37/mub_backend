import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { MedicalFitnessResults } from '../shared/enums.dto';

export class AdminUpsertMedicalDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  reportFileUrl!: string;

  @ApiProperty({ enum: MedicalFitnessResults, example: 'FIT' })
  @IsIn(MedicalFitnessResults)
  result!: 'FIT' | 'UNFIT';

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
