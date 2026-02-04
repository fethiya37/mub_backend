import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCompanyExpenseTypeDto {
  @ApiProperty({ example: 'Fuel' })
  @IsString()
  @MinLength(2)
  name!: string;
}
