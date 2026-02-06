import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ApplicantQualificationDto {
  @ApiProperty({ example: 'COC Level III' })
  @IsString()
  @MinLength(2)
  qualification!: string;
}
