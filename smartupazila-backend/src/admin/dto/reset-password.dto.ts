import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'adminResetPass123', description: 'অ্যাডমিনের সেট করা নতুন পাসওয়ার্ড' })
  @IsString()
  @MinLength(6, { message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' })
  @IsNotEmpty({ message: 'নতুন পাসওয়ার্ড দিন' })
  newPassword: string;
}
