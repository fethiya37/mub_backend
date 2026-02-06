import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ToBoolean } from './transforms';

export class ApplicantSkillDto {
  @ApiProperty({ example: 'uuid-skill-id' })
  @IsUUID()
  skillId!: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasSkill?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  willingToLearn?: boolean;
}
