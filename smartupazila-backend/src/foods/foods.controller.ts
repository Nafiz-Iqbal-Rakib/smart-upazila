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
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(
    private service: FoodsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'নতুন খাবারের তথ্য যোগ করো (admin only) - সরাসরি ছবি ফাইল অথবা imageUrl দেওয়া যাবে',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  async create(
    @Body() dto: CreateFoodDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/foods');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'খাবারের তালিকা দেখো (public)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isAreaSpecial', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('category') category?: string,
    @Query('isAreaSpecial') isAreaSpecial?: string,
    @Query('search') search?: string,
  ) {
    const specialFilter = isAreaSpecial !== undefined ? isAreaSpecial === 'true' : undefined;
    return this.service.findAll(category, specialFilter, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'নির্দিষ্ট খাবারের বিস্তারিত তথ্য দেখো (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'খাবারের তথ্য আপডেট করো (admin only)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFoodDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadImage(file, 'smartupazila/foods');
      dto.imageUrl = uploadRes.secure_url;
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'খাবারের তথ্য মুছে ফেলো (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
