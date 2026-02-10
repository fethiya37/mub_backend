import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { EmployerRegisterDto } from '../employer-register.dto';

export class AdminCreateEmployerDto extends EmployerRegisterDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoApprove?: boolean;
}
