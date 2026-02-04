import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';
import { EmbassyProcessStatuses } from '../shared/enums.dto';

export class AdminUpsertEmbassyProcessDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty({ enum: EmbassyProcessStatuses, example: 'PENDING' })
  @IsIn(EmbassyProcessStatuses)
  status!: 'PENDING' | 'COMPLETED';
}
