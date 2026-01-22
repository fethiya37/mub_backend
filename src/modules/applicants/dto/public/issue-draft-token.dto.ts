import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class IssueDraftTokenDto {
  @ApiProperty({ example: '+251911111111' })
  @IsString()
  @MinLength(6)
  phone!: string;

  @ApiPropertyOptional({ example: 'P12345678', description: 'Optional extra validation for re-issuing token' })
  @IsOptional()
  @IsString()
  passportNumber?: string;
}
