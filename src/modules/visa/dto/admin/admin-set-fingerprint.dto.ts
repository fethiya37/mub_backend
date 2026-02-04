import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AdminSetFingerprintDto {
  @ApiProperty()
  @IsBoolean()
  isDone!: boolean;
}
