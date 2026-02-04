import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ApplicantQualificationDto {
  @ApiProperty({ example: 'High School' })
  @IsString()
  @MinLength(2)
  qualification!: string;
}
