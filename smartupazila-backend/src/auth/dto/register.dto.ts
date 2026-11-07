import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'মো. রফিকুল ইসলাম', description: 'নাগরিকের পুরো নাম' })
  @IsString()
  @IsNotEmpty({ message: 'নাম প্রদান করুন' })
  name: string;

  @ApiProperty({ example: '01712345678', description: 'সঠিক বাংলাদেশি মোবাইল নম্বর' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 017xxxxxxxx)' })
