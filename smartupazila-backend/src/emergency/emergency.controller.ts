import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { EmergencyContact } from './emergency-contact.entity';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';

@ApiTags('emergency')
@Controller('emergency')
export class EmergencyController {
  constructor(private service: EmergencyService) {}

  @Get()
  @ApiOperation({ summary: 'Emergency contacts খোঁজো (public — token লাগবে না)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'address', required: false, type: String })
  findAll(
    @Query('category') category?: string,
    @Query('address') address?: string,
  ): Promise<EmergencyContact[]> {
    return this.service.findAll(category, address);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'নতুন emergency contact যোগ করো (admin only)' })
  create(@Body() dto: CreateEmergencyContactDto) {
    return this.service.create(dto);
  }
}

