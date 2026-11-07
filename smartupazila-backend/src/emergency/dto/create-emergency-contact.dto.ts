import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmergencyContactDto {
  @ApiProperty({ example: 'জাতীয় জরুরি সেবা' })
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({ example: 'Emergency' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '999' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'সারাদেশ' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

