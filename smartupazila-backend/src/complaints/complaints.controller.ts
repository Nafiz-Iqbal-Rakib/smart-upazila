import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(
    private service: ComplaintsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'নতুন অভিযোগ জমা দাও (ঐচ্ছিক প্রাইভেট ছবি ফাইল অথবা imageUrl সহ)',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  async create(
    @Req() req: any,
    @Body() dto: CreateComplaintDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imagePublicId: string | undefined;
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadPrivateImage(
        file,
        'smartupazila/complaints',
      );
      imagePublicId = uploadRes.public_id;
      dto.imageUrl = undefined;
    }
    return this.service.create(req.user.userId, dto, imagePublicId);
  }

  @Get()
  @ApiOperation({ summary: 'আমার সব অভিযোগ দেখো' })
  findMy(@Req() req: any) {
    return this.service.findMyComplaints(req.user.userId);
  }

  @Get('track/:trackingId')
  @ApiOperation({ summary: 'Tracking ID দিয়ে status জানো' })
  track(@Param('trackingId') trackingId: string, @Req() req: any) {
    return this.service.findByTrackingId(trackingId, req.user);
  }
}
