import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FlightBookingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  pnr!: string;

  @ApiPropertyOptional()
  airline?: string | null;

  @ApiPropertyOptional()
  departureAt?: string | null;

  @ApiPropertyOptional()
  arrivalAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
