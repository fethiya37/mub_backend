import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AdminBookFlightTicketDto {
  @ApiProperty()
  @IsString()
  ticketNumber!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  ticketFile?: any;
}
