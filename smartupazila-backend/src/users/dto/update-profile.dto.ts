import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'মোঃ তানভীর আহমেদ' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'নাম অন্তত ২ অক্ষরের হতে হবে' })
  name?: string;

  @ApiPropertyOptional({ example: 'citizen@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'সঠিক ইমেইল ঠিকানা দিন' })
  email?: string;

  @ApiPropertyOptional({ example: 'গ্রাম: চরপাড়া, ইউনিয়ন: সদর' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'প্রোফাইল ছবি (ঐচ্ছিক - আপলোড করলে Cloudinary-তে সেভ হবে)',
  })
  @IsOptional()
  avatar?: any;
}
