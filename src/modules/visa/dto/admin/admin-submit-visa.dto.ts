import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminSubmitVisaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
