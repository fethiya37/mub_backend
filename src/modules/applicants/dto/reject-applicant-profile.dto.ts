import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectApplicantProfileDto {
  @ApiProperty({ example: 'Passport number mismatch' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
