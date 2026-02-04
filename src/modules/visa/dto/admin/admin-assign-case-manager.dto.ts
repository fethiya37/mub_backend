import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminAssignCaseManagerDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  caseManagerUserId!: string;
}
