import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateFoodDto {
  @ApiProperty({ example: 'চমচম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'পোড়াবাড়ির বিখ্যাত রসালো খাঁটি চমচম' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'মিষ্টি' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ default: false, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isAreaSpecial?: boolean;
