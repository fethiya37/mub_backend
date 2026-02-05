import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: 'Electrical Wiring & Installation' })
  @IsString()
  @MinLength(2)
  name!: string;
}
