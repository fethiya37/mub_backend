import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: '+251900000000', description: 'Email or phone' })
  @IsString()
  identifier!: string;
}
