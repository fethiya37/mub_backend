import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectApplicantDto {
  @ApiProperty({ example: 'Passport expiry date is invalid' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
