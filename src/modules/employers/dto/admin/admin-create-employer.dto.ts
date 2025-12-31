import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { EmployerRegisterDto } from '../employer-register.dto';

export class AdminCreateEmployerDto extends EmployerRegisterDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;
}
