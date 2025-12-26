import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: 'jti.token' })
  @IsString()
  refreshToken!: string;
}
