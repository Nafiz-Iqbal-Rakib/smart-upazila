import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiPropertyOptional({
    example: 'রাস্তাঘাট',
    description: 'ক্যাটাগরি (ঐচ্ছিক - নাগরিক না দিলে AI নিজে বিবরণ পড়ে ক্যাটাগরি তৈরি করবে)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 'পাশের রাস্তায় কালভার্ট ভেঙে বড় গর্ত হয়েছে', description: 'সমস্যার বিবরণ' })
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
