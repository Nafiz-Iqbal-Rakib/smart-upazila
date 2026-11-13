import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department, Role } from '../../users/user.entity';

export class CreateStaffDto {
  @ApiProperty({ example: 'জনাব আহমেদ', description: 'কর্মকর্তা বা অ্যাডমিনের নাম' })
  @IsString()
  @IsNotEmpty({ message: 'নাম প্রদান করুন' })
  name: string;

  @ApiProperty({ example: '01711223344', description: 'মোবাইল নম্বর' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'সঠিক বাংলাদেশি ফোন নম্বর দিন' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'officer@upazila.gov.bd' })
  @IsOptional()
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিন' })
  email?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'কর্মকর্তা বা স্টাফের জাতীয় পরিচয়পত্র (NID) নম্বর (১০, ১৩ বা ১৭ ডিজিট)',
  })
  @Matches(/^\d{10}(\d{3}|\d{7})?$/, {
    message: 'সঠিক ১০, ১৩ অথবা ১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID) নম্বর দিন',
