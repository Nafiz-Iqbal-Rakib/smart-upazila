import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ example: 'road', description: 'Category (waste, drainage, road...)' })
  @IsString()
  @IsNotEmpty({ message: 'Category দিন (waste, drainage, road...)' })
  @MaxLength(50)
  category: string;

