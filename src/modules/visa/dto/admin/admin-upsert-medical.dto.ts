import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { MedicalFitnessResults } from '../shared/enums.dto';

export class AdminUpsertMedicalDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  reportFile?: any;

  @ApiPropertyOptional({ example: '/uploads/visa/medical/report.pdf', nullable: true })
  @IsOptional()
  @IsString()
  reportFileUrl?: string | null;

  @ApiProperty({ enum: MedicalFitnessResults, example: 'FIT' })
  @IsIn(MedicalFitnessResults)
  result!: 'FIT' | 'UNFIT';

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
