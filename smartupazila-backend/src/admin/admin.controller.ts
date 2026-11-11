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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { ListComplaintsDto } from './dto/list-complaints.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { AssignOfficerDto } from './dto/assign-officer.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // 1. Dashboard Stats
  @Get('stats')
  @ApiOperation({ summary: 'অ্যাডমিন ড্যাশবোর্ড পরিসংখ্যান (Users, Complaints, Services)' })
  stats() {
    return this.adminService.getStats();
  }

  // 2. Pending Users
  @Get('users/pending')
  @ApiOperation({ summary: 'Approval-এর অপেক্ষায় থাকা user-দের লিস্ট' })
  pending() {
    return this.adminService.findPendingUsers();
