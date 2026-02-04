import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateApplicantExpenseTypeDto {
  @ApiPropertyOptional({ example: 'Visa Fee' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
