import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateCvTemplateDto {
  @ApiProperty({ example: 'Default Template v1' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ required: false, example: 'Simple professional template' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'HTML template with placeholders', example: '<html><head>{{CSS}}</head><body>{{BODY}}</body></html>' })
  @IsString()
  @MinLength(10)
  htmlTemplate!: string;

  @ApiPropertyOptional({ required: false, description: 'CSS string', example: 'body{font-family:Arial;}' })
  @IsOptional()
  @IsString()
  cssStyle?: string;

  @ApiPropertyOptional({ required: false, default: true, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
