import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'আমার প্রোফাইল দেখুন (নাগরিক/কর্মকর্তা/অ্যাডমিন)' })
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'প্রোফাইল আপডেট করুন (নাম, ঠিকানা, ইমেইল ও ঐচ্ছিক প্রোফাইল ছবি)',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto, avatar);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'পাসওয়ার্ড পরিবর্তন করুন' })
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
