import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingType } from '../community-listing.entity';

export class CreateCommunityListingDto {
  @ApiProperty({ example: 'উপজেলা সরকারি পাইলট উচ্চ বিদ্যালয়' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ListingType, example: ListingType.SCHOOL })
  @IsEnum(ListingType, {
    message: 'সঠিক টাইপ নির্বাচন করুন (SCHOOL, COLLEGE, MADARASA, LOCAL_BUSINESS, CLINIC, FACILITY, OTHER)',
  })
  type: ListingType;

  @ApiPropertyOptional({ example: '১ম থেকে ১০ম শ্রেণি পর্যন্ত সহপাঠ ও সুবর্ণ ফলাফল' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'উপজেলা পরিষদ সংলগ্ন' })
