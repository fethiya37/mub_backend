import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MinLength } from 'class-validator';

export class AdminCreateApplicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  applicantId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  jobPostingId!: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  cvFileUrl!: string;
}
