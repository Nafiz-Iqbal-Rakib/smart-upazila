import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'মো. রফিকুল ইসলাম', description: 'নাগরিকের পুরো নাম' })
  @IsString()
  @IsNotEmpty({ message: 'নাম প্রদান করুন' })
  name: string;

  @ApiProperty({ example: '01712345678', description: 'সঠিক বাংলাদেশি মোবাইল নম্বর' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 017xxxxxxxx)' })
  phoneNumber: string;

  @ApiProperty({ example: 'citizen@example.com', description: 'নাগরিকের ইমেইল অ্যাড্রেস' })
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিন' })
  email: string;

  @ApiProperty({ example: '1234567890', description: 'জাতীয় পরিচয়পত্র (NID) নম্বর (১০, ১৩ বা ১৭ ডিজিট)' })
  @Matches(/^\d{10}(\d{3}|\d{7})?$/, {
    message: 'সঠিক ১০, ১৩ অথবা ১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID) নম্বর দিন',
  })
  nid: string;

  @ApiProperty({ example: 'গ্রাম: চরপাড়া, ইউনিয়ন: সদর, উপজেলা সদর', description: 'স্থায়ী/বর্তমান ঠিকানা' })
  @IsString()
  @IsNotEmpty({ message: 'ঠিকানা প্রদান করুন' })
  address: string;

  @ApiProperty({ example: 'secret123', description: 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড' })
  @IsString()
  @MinLength(6, { message: 'Password কমপক্ষে ৬ অক্ষরের হতে হবে' })
  password: string;
}
