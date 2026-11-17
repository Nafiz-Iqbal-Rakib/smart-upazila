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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoticesService } from './notices.service';
import { NoticeCategory, NoticePriority } from './notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('notices')
@Controller('notices')
export class NoticesController {
  constructor(
    private readonly service: NoticesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'নতুন নোটিশ/ঘোষণা প্রকাশ করো (admin only) - সরাসরি ছবি ফাইল অথবা imageUrl দেওয়া যাবে',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  async create(
    @Req() req: any,
    @Body() dto: CreateNoticeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
