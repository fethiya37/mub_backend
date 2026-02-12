import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminResetApplicantPasswordDto {
  @ApiPropertyOptional({ example: 'TempPass123!' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
