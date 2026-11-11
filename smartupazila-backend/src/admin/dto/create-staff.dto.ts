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

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  nid?: string;

  @ApiPropertyOptional({ example: 'উপজেলা পরিষদ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'admin123', description: 'পাসওয়ার্ড' })
  @IsString()
  @MinLength(6, { message: 'Password কমপক্ষে ৬ অক্ষরের হতে হবে' })
  password: string;

  @ApiProperty({ enum: Role, example: Role.OFFICER, description: 'নির্ধারিত রোল (ADMIN, OFFICER, MODERATOR...)' })
  @IsEnum(Role, { message: 'সঠিক রোল দিন' })
  role: Role;

  @ApiPropertyOptional({ enum: Department, example: Department.ROAD, description: 'বিভাগ (শুধু OFFICER হলে প্রযোজ্য)' })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;
}

