import { ApiProperty,  } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ApplicantSkillDto {
  @ApiProperty({ example: 'Electrical Wiring & Installation' })
  @IsString()
  @MinLength(2)
  skillName!: string;
}
