import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './cloudinary.provider';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private configService: ConfigService,
    @Inject(CLOUDINARY) _cloudinaryConfig: unknown,
  ) {}

  /**
   * Upload an image file buffer to Cloudinary
   * @param file Express.Multer.File
   * @param folder Subfolder name in Cloudinary (e.g. 'smartupazila/foods')
   * @param isPrivate When true, uploads as 'authenticated' (not accessible via plain public URL)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'smartupazila',
    isPrivate: boolean = false,
  ): Promise<UploadApiResponse> {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        'Cloudinary কনফিগারেশন অনুপস্থিত! .env ফাইলে CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ও CLOUDINARY_API_SECRET যোগ করুন।',
      );
    }

    if (!file) {
      throw new BadRequestException('কোনো ফাইল নির্বাচন করা হয়নি');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WEBP ইত্যাদি) আপলোড করা যাবে');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('ইমেজ ফাইলের সাইজ সর্বোচ্চ 5MB হতে পারবে');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
