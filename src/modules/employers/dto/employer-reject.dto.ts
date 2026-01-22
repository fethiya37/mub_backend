import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class EmployerRejectDto {
  @ApiProperty({ example: 'Invalid license document' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
