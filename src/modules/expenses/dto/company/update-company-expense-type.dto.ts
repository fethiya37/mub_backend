import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCompanyExpenseTypeDto {
  @ApiPropertyOptional({ example: 'Office Rent' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
