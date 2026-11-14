import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodGroup } from '../blood-donor.entity';

export class CreateBloodDonorDto {
  @ApiProperty({ example: 'কামাল হোসেন' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.O_POS })
  @IsEnum(BloodGroup, { message: 'সঠিক blood group দিন (A+, B-, O- ইত্যাদি)' })
  bloodGroup: BloodGroup;

  @ApiProperty({ example: '01712345678' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'সঠিক ফোন নম্বর দিন' })
  phoneNumber: string;
