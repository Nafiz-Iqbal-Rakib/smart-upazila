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

  @ApiPropertyOptional({ example: '৩৫০-৪৫০ টাকা/কেজি' })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiProperty({ example: 'বাজার রোড, সদর' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'https://example.com/chomchom.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'খাবারের ছবি ফাইল (ঐচ্ছিক - সরাসরি আপলোড করলে Cloudinary-তে সেভ হবে)',
  })
  @IsOptional()
  image?: any;
}
