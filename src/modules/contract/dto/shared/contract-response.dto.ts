import { ApiProperty } from '@nestjs/swagger';

export class ContractResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  contractNumber!: string;

  @ApiProperty()
  contractFileUrl!: string;

  @ApiProperty()
  signedFileUrl!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  contractPeriodYears!: number | null;

  @ApiProperty()
  monthlySalary!: number | null;

  @ApiProperty()
  currency!: string | null;

  @ApiProperty()
  issuedAt!: Date;

  @ApiProperty()
  signedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
