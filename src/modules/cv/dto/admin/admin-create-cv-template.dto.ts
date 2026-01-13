import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateCvTemplateDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'HTML template with placeholders' })
  @IsString()
  @MinLength(10)
  htmlTemplate!: string;

  @ApiProperty({ required: false, description: 'CSS string' })
  @IsOptional()
  @IsString()
  cssStyle?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
