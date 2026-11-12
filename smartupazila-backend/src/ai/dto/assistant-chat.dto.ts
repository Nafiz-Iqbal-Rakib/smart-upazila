import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssistantChatDto {
  @ApiProperty({
    example: 'আমার এলাকায় O+ রক্ত লাগবে এবং জরুরি পুলিশ কন্ট্রোল রুমের নম্বর কত?',
    description: 'নাগরিক বা কর্মকর্তার জিজ্ঞাসা',
  })
  @IsString()
  @IsNotEmpty({ message: 'মেসেজ দিন' })
  message: string;
}

