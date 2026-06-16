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
  ticketNumber?: string | null;

  @ApiPropertyOptional()
  departureAt?: string | null;

  @ApiPropertyOptional()
  arrivalAt?: string | null;

  @ApiPropertyOptional()
  ticketFileUrl?: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
