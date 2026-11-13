import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../users/user.entity';

export class ListUsersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'নাম বা ফোন নম্বর দিয়ে সার্চ' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

