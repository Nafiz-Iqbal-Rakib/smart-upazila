import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../complaints/complaint.entity';

export class UpdateComplaintStatusDto {
  @ApiProperty({ enum: Status, example: Status.IN_PROGRESS })
  @IsEnum(Status, { message: 'সঠিক Status দিন (PENDING, IN_PROGRESS, RESOLVED, REJECTED)' })
  @IsNotEmpty()
  status: Status;

  @ApiPropertyOptional({
    example: 'রাস্তা সংস্কারের জন্য টিম পাঠানো হয়েছে, আগামী ২ দিনের মধ্যে কাজ সম্পন্ন হবে।',
    description: 'নাগরিকের দেখার জন্য অফিসারের সমাধান মন্তব্য বা প্রগ্রেস নোট',
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: 'নির্দিষ্ট কোনো অফিসারের UUID এর কাছে রি-অ্যাসাইন করার জন্য' })
  @IsOptional()
  @IsUUID()
  assignTo?: string;
}
