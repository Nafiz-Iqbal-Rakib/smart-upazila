import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NoticeCategory, NoticePriority } from '../notice.entity';

export class CreateNoticeDto {
  @ApiProperty({
    example: 'উপজেলায় আগামী শনিবার বিদ্যুৎ সরবরাহ বন্ধ থাকার জরুরি নোটিশ',
  })
  @IsString()
  @IsNotEmpty({ message: 'নোটিশের শিরোনাম দিন' })
  title: string;

  @ApiProperty({
    example:
      'লাইন সংস্কারের জন্য আগামী শনিবার সকাল ৮টা থেকে দুপুর ২টা পর্যন্ত উপজেলা সদর ও পার্শ্ববর্তী এলাকায় বিদ্যুৎ সরবরাহ বন্ধ থাকবে।',
  })
  @IsString()
  @IsNotEmpty({ message: 'নোটিশের বিস্তারিত বিবরণ দিন' })
  content: string;

  @ApiPropertyOptional({
    enum: NoticeCategory,
    default: NoticeCategory.GENERAL,
    example: NoticeCategory.ELECTRICITY,
  })
  @IsOptional()
  @IsEnum(NoticeCategory, { message: 'সঠিক ক্যাটাগরি দিন' })
  category?: NoticeCategory;
