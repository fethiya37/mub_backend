import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdateCvDto {
  @ApiProperty()
  @IsString()
  @IsUrl()
  cvFileUrl!: string;
}
