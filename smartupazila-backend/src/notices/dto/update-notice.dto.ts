import { PartialType } from '@nestjs/swagger';
import { CreateNoticeDto } from './create-notice.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {
  @ApiPropertyOptional({ example: true, description: 'নোটিশটি সক্রিয় থাকবে কিনা' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isActive?: boolean;
}
