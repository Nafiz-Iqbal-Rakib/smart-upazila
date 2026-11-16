import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignOfficerDto {
  @ApiProperty({ description: 'দায়িত্বপ্রাপ্ত কর্মকর্তার UUID' })
  @IsUUID()
  @IsNotEmpty()
  officerId: string;
}
