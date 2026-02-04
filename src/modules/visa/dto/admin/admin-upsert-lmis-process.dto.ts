import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';
import { LMISStatuses } from '../shared/enums.dto';

export class AdminUpsertLmisProcessDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty({ enum: LMISStatuses, example: 'PENDING' })
  @IsIn(LMISStatuses)
  status!: 'PENDING' | 'ISSUED' | 'REJECTED';
}
