import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateApplicantExpenseTypeDto {
  @ApiProperty({ example: 'Medical' })
  @IsString()
  @MinLength(2)
  name!: string;
}
