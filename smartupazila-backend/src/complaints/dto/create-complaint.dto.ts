import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ example: 'road', description: 'Category (waste, drainage, road...)' })
  @IsString()
  @IsNotEmpty({ message: 'Category দিন (waste, drainage, road...)' })
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 'পাশের রাস্তায় ময়লা জমে জলাবদ্ধতা হচ্ছে', description: 'সমস্যার বিবরণ' })
  @IsString()
  @IsNotEmpty({ message: 'সমস্যার বিবরণ লিখুন' })
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/waste.jpg', description: 'ছবির লিংক (ঐচ্ছিক)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'সমস্যার ছবি ফাইল (ঐচ্ছিক - ছবি আপলোড করলে Cloudinary-তে সেভ হবে)',
  })
  @IsOptional()
  image?: any;
}
