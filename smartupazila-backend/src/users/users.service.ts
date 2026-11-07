import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        nid: true,
        address: true,
        avatarUrl: true,
        avatarPublicId: true,
        role: true,
        department: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি');

    const { avatarPublicId, ...profile } = user;
    if (avatarPublicId) {
      profile.avatarUrl = this.cloudinaryService.getSignedImageUrl(avatarPublicId);
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি');

    // Check duplicate email if email is being updated
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOneBy({ email: dto.email });
      if (existing && existing.id !== userId) {
        throw new ConflictException('এই ইমেইলটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হয়েছে');
      }
      user.email = dto.email;
    }

    if (dto.name) user.name = dto.name;
    if (dto.address) user.address = dto.address;

    // Handle private avatar upload via Cloudinary (authenticated)
    if (avatarFile) {
      const oldPublicId = user.avatarPublicId;
      const uploadRes = await this.cloudinaryService.uploadPrivateImage(
        avatarFile,
        'smartupazila/avatars',
      );
      user.avatarPublicId = uploadRes.public_id;
      user.avatarUrl = null;
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId, true);
      }
    } else if (dto.avatarUrl) {
      user.avatarUrl = dto.avatarUrl;
      user.avatarPublicId = null;
    }

    await this.userRepo.save(user);

    return {
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
      user: await this.getProfile(userId),
    };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি');

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('বর্তমান পাসওয়ার্ডটি সঠিক নয়');
    }

    if (oldPass === newPass) {
      throw new BadRequestException('নতুন পাসওয়ার্ডটি বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে');
    }

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await this.userRepo.save(user);

    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' };
  }

  async adminResetPassword(userId: string, newPass: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি');

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await this.userRepo.save(user);

    return {
      success: true,
      message: `ইউজার ${user.name} (${user.phoneNumber})-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে`,
    };
  }
}
