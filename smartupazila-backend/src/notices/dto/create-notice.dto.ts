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

  @ApiPropertyOptional({
    enum: NoticePriority,
    default: NoticePriority.NORMAL,
    example: NoticePriority.URGENT,
  })
  @IsOptional()
  @IsEnum(NoticePriority, { message: 'সঠিক প্রায়োরিটি দিন' })
  priority?: NoticePriority;

  @ApiPropertyOptional({ example: 'https://example.com/notice.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/notice.pdf' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'সঠিক তারিখ ফরম্যাট দিন (ISO 8601)' })
  expiresAt?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'নোটিশের ব্যানার বা বিজ্ঞপ্তির ছবি (ঐচ্ছিক - ক্লাউডিনারিতে আপলোড হবে)',
  })
  @IsOptional()
  image?: any;
}
