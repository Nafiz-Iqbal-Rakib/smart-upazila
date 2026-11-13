import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department, Role, User } from '../users/user.entity';
import { Complaint, Status } from '../complaints/complaint.entity';
import { EmergencyContact } from '../emergency/emergency-contact.entity';
import { BloodDonor } from '../blood-donors/blood-donor.entity';
import { Food } from '../foods/food.entity';
import { Place } from '../places/place.entity';
import { CommunityListing } from '../community/community-listing.entity';
import { Notice } from '../notices/notice.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { ListComplaintsDto } from './dto/list-complaints.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Complaint)
    private complaintRepo: Repository<Complaint>,
    @InjectRepository(EmergencyContact)
    private emergencyRepo: Repository<EmergencyContact>,
    @InjectRepository(BloodDonor)
    private donorRepo: Repository<BloodDonor>,
    @InjectRepository(Food)
    private foodRepo: Repository<Food>,
    @InjectRepository(Place)
    private placeRepo: Repository<Place>,
    @InjectRepository(CommunityListing)
    private communityRepo: Repository<CommunityListing>,
    @InjectRepository(Notice)
    private noticeRepo: Repository<Notice>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // 1. Pending Users
  findPendingUsers() {
    return this.userRepo.find({
      where: { isApproved: false },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        nid: true,
        address: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  // 1b. Create Staff / Admin (Superadmin Only)
  async createStaff(dto: CreateStaffDto) {
    const phoneExists = await this.userRepo.findOneBy({ phoneNumber: dto.phoneNumber });
    if (phoneExists) throw new ConflictException('এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');

    if (dto.email) {
      const emailExists = await this.userRepo.findOneBy({ email: dto.email });
      if (emailExists) throw new ConflictException('এই ইমেইলে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');
    }

    const nidExists = await this.userRepo.findOneBy({ nid: dto.nid });
    if (nidExists) throw new ConflictException('এই NID নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const staff = this.userRepo.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email || null,
      nid: dto.nid || null,
      address: dto.address || null,
