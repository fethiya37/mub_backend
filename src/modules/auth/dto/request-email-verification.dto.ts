import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestEmailVerificationDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email only' })
  @IsEmail()
  email!: string;
}
