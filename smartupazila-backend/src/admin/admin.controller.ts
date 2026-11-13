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
  }

  @Patch('users/:id/approve')
  @ApiOperation({ summary: 'User approve করো' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approve(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'User reject করে মুছে দাও' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.reject(id);
  }

  // 3. User Listing & Management
  @Post('users')
  @ApiOperation({ summary: 'নতুন কর্মকর্তা/অ্যাডমিন অ্যাকাউন্ট তৈরি করো (শুধুমাত্র সুপার অ্যাডমিন)' })
  createStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.createStaff(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'সব user-এর লিস্ট (search + pagination)' })
  listUsers(@Query() q: ListUsersDto) {
    return this.adminService.findAllUsers(q);
  }

  @Patch('users/:id/block')
  @ApiOperation({ summary: 'User block করো' })
  block(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.adminService.setActive(id, req.user.userId, false);
  }

  @Patch('users/:id/unblock')
  @ApiOperation({ summary: 'User unblock করো' })
  unblock(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.adminService.setActive(id, req.user.userId, true);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'User-এর Role পরিবর্তন করো' })
  changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.adminService.changeRole(id, req.user.userId, dto.role, dto.department);
