import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ApplicantSkillDto {
  @ApiProperty({ example: 'Electrical Wiring & Installation' })
  @IsString()
  @MinLength(2)
  skillName!: string;

  @ApiPropertyOptional({ example: 'INTERMEDIATE', description: 'Any string label used by frontend (BEGINNER/INTERMEDIATE/ADVANCED)' })
  @IsOptional()
  @IsString()
  proficiencyLevel?: string;

  @ApiPropertyOptional({ example: 6, description: 'Years of experience in this skill' })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;
}
