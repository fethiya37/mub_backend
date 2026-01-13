import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminAddComplianceCheckDto {
  @ApiProperty({ example: 'Ethiopian labor approval' })
  @IsString()
  @MinLength(2)
  requirementType!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
