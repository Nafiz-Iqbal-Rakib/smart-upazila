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
