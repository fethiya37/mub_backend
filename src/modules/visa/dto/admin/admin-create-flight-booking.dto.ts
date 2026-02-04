import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateFlightBookingDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  pnr!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  airline?: string;

  @ApiPropertyOptional({ example: '2026-03-01T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  departureAt?: string;

  @ApiPropertyOptional({ example: '2026-03-01T18:00:00.000Z' })
  @IsOptional()
  @IsString()
  arrivalAt?: string;
}
