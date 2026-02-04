import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminCreateVisaReturnDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  reason!: string;
}
