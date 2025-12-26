import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class AddSkillDto {
  @ApiProperty({ example: 'Cooking' })
  @IsString()
  @MinLength(2)
  skillName!: string;

  @ApiPropertyOptional({ example: 'INTERMEDIATE' })
  @IsOptional()
  @IsString()
  proficiencyLevel?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;
}
