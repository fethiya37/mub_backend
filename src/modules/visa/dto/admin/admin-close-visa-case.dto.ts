import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AdminCloseVisaCaseDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
