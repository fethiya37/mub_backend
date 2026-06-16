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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departureAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arrivalAt?: string;
}
