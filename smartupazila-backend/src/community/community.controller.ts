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
import { CommunityService } from './community.service';
import { ListingType } from './community-listing.entity';
import { CreateCommunityListingDto } from './dto/create-community-listing.dto';
import { UpdateCommunityListingDto } from './dto/update-community-listing.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(
    private service: CommunityService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'নতুন কমিউনিটি লিস্টিং যোগ করো (admin only) - সরাসরি ছবি ফাইল অথবা imageUrl দেওয়া যাবে',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  async create(
    @Body() dto: CreateCommunityListingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/community');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'কমিউনিটি লিস্টিংয়ের তালিকা দেখো (public)' })
  @ApiQuery({ name: 'type', required: false, enum: ListingType })
  @ApiQuery({ name: 'address', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('type') type?: ListingType,
    @Query('address') address?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(type, address, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'নির্দিষ্ট লিস্টিংয়ের বিস্তারিত তথ্য দেখো (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'লিস্টিংয়ের তথ্য আপডেট করো (admin only)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommunityListingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/community');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'লিস্টিং মুছে ফেলো (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
