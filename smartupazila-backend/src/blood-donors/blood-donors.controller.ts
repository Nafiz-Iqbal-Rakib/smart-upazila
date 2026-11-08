import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BloodDonorsService } from './blood-donors.service';
import { BloodGroup } from './blood-donor.entity';
import { CreateBloodDonorDto } from './dto/create-blood-donor.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';

@ApiTags('blood-donors')
@Controller('blood-donors')
export class BloodDonorsController {
  constructor(private service: BloodDonorsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'নতুন blood donor যোগ করো (admin/moderator)' })
  create(@Body() dto: CreateBloodDonorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Blood group ও এলাকা দিয়ে donor খোঁজো (public)' })
  @ApiQuery({ name: 'bloodGroup', required: false, enum: BloodGroup })
  @ApiQuery({ name: 'address', required: false, type: String })
  findAll(
    @Query('bloodGroup') bloodGroup?: BloodGroup,
    @Query('address') address?: string,
  ) {
    return this.service.findAll(bloodGroup, address);
  }

  @Get(':id')
