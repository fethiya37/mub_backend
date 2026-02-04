import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SponsorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional()
  sponsorIdFileUrl?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
