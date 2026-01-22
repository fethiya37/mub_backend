import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminRejectLocalAgencyDto {
  @ApiProperty({ example: 'License number does not match MoLS registry' })
  @IsString()
  @MinLength(2)
  reason!: string;
}
