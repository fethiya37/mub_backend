import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { EmployerDecisions } from '../shared/enums.dto';

export class EmployerDecideApplicationDto {
  @ApiProperty({ enum: EmployerDecisions, example: 'SELECT' })
  @IsIn(EmployerDecisions)
  decision!: 'SELECT' | 'REJECT';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  reason?: string;
}
