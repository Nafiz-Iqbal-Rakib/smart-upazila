import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'বর্তমান পাসওয়ার্ড' })
  @IsString()
  @IsNotEmpty({ message: 'বর্তমান পাসওয়ার্ড দিন' })
  oldPassword: string;

  @ApiProperty({ example: 'newStrongPassword456', description: 'নতুন পাসওয়ার্ড (অন্তত ৬ অক্ষর)' })
  @IsString()
  @MinLength(6, { message: 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' })
  @IsNotEmpty({ message: 'নতুন পাসওয়ার্ড দিন' })
  newPassword: string;
}
