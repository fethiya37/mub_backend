import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpdateCvTemplateDto {
  @ApiPropertyOptional({ required: false, example: 'Updated Template Name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ required: false, example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ required: false, example: '<html><head>{{CSS}}</head><body>{{BODY}}</body></html>' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  htmlTemplate?: string;

  @ApiPropertyOptional({ required: false, example: 'body{font-family:Arial;}' })
  @IsOptional()
  @IsString()
  cssStyle?: string;

  @ApiPropertyOptional({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
