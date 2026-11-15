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

  @ApiPropertyOptional({ example: 'https://example.com/palace.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '২০ টাকা', default: 'মুক্ত' })
  @IsOptional()
  @IsString()
  entryFee?: string;

  @ApiPropertyOptional({ example: 'সকাল ৯টা - সন্ধ্যা ৬টা' })
  @IsOptional()
  @IsString()
  openingHours?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'স্থানের ছবি ফাইল (ঐচ্ছিক - ছবি আপলোড করলে Cloudinary-তে সেভ হবে)',
  })
  @IsOptional()
  image?: any;
}
