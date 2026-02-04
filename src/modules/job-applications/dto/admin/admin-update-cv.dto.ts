import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class AdminUpdateCvDto {
  @ApiProperty()
  @IsString()
  @IsUrl()
  cvFileUrl!: string;
}
