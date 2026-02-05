import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSkillDto {
  @ApiPropertyOptional({ example: 'Electrical Wiring' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
