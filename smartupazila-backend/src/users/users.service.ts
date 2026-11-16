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
