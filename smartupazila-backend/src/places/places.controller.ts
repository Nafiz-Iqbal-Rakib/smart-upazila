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
import { PlacesService } from './places.service';
import { PlaceCategory } from './place.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(
    private service: PlacesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'নতুন দর্শনীয় স্থান যোগ করো (admin only) - সরাসরি ছবি ফাইল অথবা imageUrl দেওয়া যাবে',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  async create(
    @Body() dto: CreatePlaceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/places');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'দর্শনীয় স্থানের তালিকা দেখো (public)' })
  @ApiQuery({ name: 'category', required: false, enum: PlaceCategory })
  @ApiQuery({ name: 'address', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('category') category?: PlaceCategory,
    @Query('address') address?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, address, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'নির্দিষ্ট দর্শনীয় স্থানের বিস্তারিত তথ্য দেখো (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
