import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminUpdateFlightBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pnr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  airline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departureAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arrivalAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
