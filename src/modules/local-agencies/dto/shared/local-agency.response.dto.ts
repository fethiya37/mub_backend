import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocalAgencyStatuses } from '../shared/local-agency.enums.dto';

export class LocalAgencyResponseDto {
  @ApiProperty({ format: 'uuid', example: '9f8f3b2d-0b7d-4b7a-a8d0-6c9d3d5e0c11' })
  id!: string;

  @ApiProperty({ example: 'Blue Nile Recruitment PLC' })
  name!: string;

  @ApiProperty({ example: 'LIC-ETH-2026-000145' })
  licenseNumber!: string;

  @ApiPropertyOptional({ example: 'Abebe Kebede', nullable: true })
  contactPerson?: string | null;

  @ApiPropertyOptional({ example: '+251911234567', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'agency@example.com', nullable: true })
  email?: string | null;

  @ApiProperty({ enum: LocalAgencyStatuses, example: 'PENDING' })
  status!: string;

  @ApiPropertyOptional({ format: 'uuid', example: 'c1d93e1a-6b0f-4a6c-8f1e-1e0a5fdbb18a', nullable: true })
  userId?: string | null;

  @ApiPropertyOptional({ example: 'Missing license document', nullable: true })
  rejectionReason?: string | null;

  @ApiPropertyOptional({ format: 'uuid', example: 'c7db1f7f-3a7d-4c4e-9d2c-2f6a94f7b2ab', nullable: true })
  approvedBy?: string | null;

  @ApiPropertyOptional({ example: '2026-01-22T10:15:00.000Z', nullable: true })
  approvedAt?: string | null;

  @ApiPropertyOptional({ example: '2026-01-25T14:30:00.000Z', nullable: true })
  suspendedAt?: string | null;

  @ApiProperty({ example: '2026-01-22T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-22T09:30:00.000Z' })
  updatedAt!: string;
}
