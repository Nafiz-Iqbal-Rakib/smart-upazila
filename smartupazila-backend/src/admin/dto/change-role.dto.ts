import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department, Role } from '../../users/user.entity';

export class ChangeRoleDto {
  @ApiProperty({ enum: Role, example: Role.OFFICER })
  @IsEnum(Role, { message: 'সঠিক Role দিন (CITIZEN, OFFICER, MODERATOR, ADMIN ইত্যাদি)' })
  @IsNotEmpty()
  role: Role;

  @ApiPropertyOptional({ enum: Department, example: Department.ROAD })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;
}
