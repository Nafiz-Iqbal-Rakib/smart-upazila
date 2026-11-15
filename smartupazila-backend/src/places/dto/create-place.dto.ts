import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '../place.entity';

export class CreatePlaceDto {
  @ApiProperty({ example: 'ঐতিহাসিক জমিদার বাড়ি' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '২০০ বছরের পুরোনো প্রাচীন স্থাপত্য ও প্রত্নতাত্ত্বিক নিদর্শন' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.HISTORICAL })
  @IsEnum(PlaceCategory, { message: 'সঠিক ক্যাটাগরি দিন (HISTORICAL, TOURIST_SPOT, PARK, RELIGIOUS, OTHER)' })
  category: PlaceCategory;

  @ApiProperty({ example: 'গ্রাম: রাজবাড়ী, উপজেলা সদর' })
  @IsString()
  @IsNotEmpty()
  address: string;

