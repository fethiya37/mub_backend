import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminSuspendLocalAgencyDto {
  @ApiProperty({ example: 'Compliance violation: submitting forged documents' })
  @IsString()
  @MinLength(2)
  reason!: string;
}
