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
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/notices');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'উপজেলার সব সক্রিয় নোটিশের তালিকা দেখো (public)' })
  @ApiQuery({ name: 'category', required: false, enum: NoticeCategory })
  @ApiQuery({ name: 'priority', required: false, enum: NoticePriority })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('category') category?: NoticeCategory,
    @Query('priority') priority?: NoticePriority,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, priority, true, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'নির্দিষ্ট নোটিশের বিস্তারিত দেখো (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'নোটিশ আপডেট করো (admin only)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoticeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/notices');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'নোটিশ মুছে ফেলো (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
