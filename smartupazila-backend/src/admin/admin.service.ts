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
      passwordHash,
      role: dto.role,
      department: dto.role === Role.OFFICER ? dto.department || Department.OTHER : null,
      isApproved: true,
      isActive: true,
    });

    const saved = await this.userRepo.save(staff);
    return {
      message: `${saved.name} (${saved.role}${saved.department ? ' - ' + saved.department : ''}) অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে ✅`,
      user: {
        id: saved.id,
        name: saved.name,
        phoneNumber: saved.phoneNumber,
        email: saved.email,
        nid: saved.nid,
        address: saved.address,
        role: saved.role,
        department: saved.department,
        isApproved: saved.isApproved,
        isActive: saved.isActive,
      },
    };
  }

  async approve(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    user.isApproved = true;
    await this.userRepo.save(user);
    return { message: `${user.name}-এর অ্যাকাউন্ট approve হয়েছে ✅` };
  }

  async reject(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    if (user.role === Role.ADMIN) throw new BadRequestException('Admin-কে reject করা যাবে না');
    await this.userRepo.delete(id);
    return { message: 'User reject করে মুছে ফেলা হয়েছে' };
  }

  // 2. All Users (Search & Pagination)
  async findAllUsers(q: ListUsersDto) {
    const limit = Math.min(q.limit || 20, 100);
    const page = q.page || 1;

    const whereConditions: any[] = [];
    if (q.search) {
      whereConditions.push(
        { ...(q.role && { role: q.role }), name: ILike(`%${q.search}%`) },
        { ...(q.role && { role: q.role }), phoneNumber: ILike(`%${q.search}%`) },
      );
    } else if (q.role) {
      whereConditions.push({ role: q.role });
    }

    const [items, total] = await this.userRepo.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : {},
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        nid: true,
        address: true,
        role: true,
        department: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // 3. Block / Unblock & Role Change
  async setActive(id: string, adminId: string, isActive: boolean) {
    if (id === adminId) throw new BadRequestException('নিজেকে block/unblock করা যাবে না');
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    user.isActive = isActive;
    await this.userRepo.save(user);
    return { message: isActive ? 'Unblock করা হয়েছে' : 'Block করা হয়েছে' };
  }

  async changeRole(id: string, adminId: string, role: Role, department?: Department) {
    if (id === adminId) throw new BadRequestException('নিজের role বদলানো যাবে না');
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    user.role = role;
    if (role === Role.OFFICER && department) {
      user.department = department;
    } else if (role !== Role.OFFICER) {
      user.department = null;
    }
    await this.userRepo.save(user);
    return { message: `${user.name}-এর Role পরিবর্তন করে ${role} করা হয়েছে` };
  }

  async resetUserPassword(id: string, newPass: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    user.passwordHash = await bcrypt.hash(newPass, 10);
    await this.userRepo.save(user);
    return {
      success: true,
      message: `ইউজার ${user.name} (${user.phoneNumber})-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে`,
    };
  }

  // 4. Complaints Management (Officer Department Isolation & Workload)
  async findComplaints(q: ListComplaintsDto, requestingUser?: { userId: string; role: Role }) {
    const limit = Math.min(q.limit || 20, 100);
    const page = q.page || 1;

    let departmentFilter: Department | undefined;
    let assignedOfficerId: string | undefined;

    if (requestingUser && requestingUser.role === Role.OFFICER) {
      const officer = await this.userRepo.findOneBy({ id: requestingUser.userId });
      if (officer) {
        departmentFilter = officer.department || undefined;
        assignedOfficerId = officer.id;
      }
    }

    let whereCondition: any;
    if (assignedOfficerId && departmentFilter) {
      whereCondition = [
        {
          ...(q.status && { status: q.status }),
          ...(q.category && { category: ILike(`%${q.category}%`) }),
          department: departmentFilter,
        },
        {
          ...(q.status && { status: q.status }),
          ...(q.category && { category: ILike(`%${q.category}%`) }),
          assignedTo: { id: assignedOfficerId },
        },
      ];
    } else {
      whereCondition = {
        ...(q.status && { status: q.status }),
        ...(q.category && { category: ILike(`%${q.category}%`) }),
      };
    }

    const [items, total] = await this.complaintRepo.findAndCount({
      where: whereCondition,
      relations: {
        user: true,
        assignedTo: true,
        reviewedBy: true,
      },
      select: {
        id: true,
        category: true,
        department: true,
        urgency: true,
        description: true,
        imageUrl: true,
        imagePublicId: true,
        status: true,
        trackingId: true,
        adminRemark: true,
        createdAt: true,
        updatedAt: true,
        user: { id: true, name: true, phoneNumber: true },
        assignedTo: { id: true, name: true, department: true },
        reviewedBy: { id: true, name: true, phoneNumber: true, role: true },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const sanitizedItems = items.map((item) => {
      const { imagePublicId, ...rest } = item;
      return {
        ...rest,
        imageUrl: imagePublicId
          ? this.cloudinaryService.getSignedImageUrl(imagePublicId)
          : rest.imageUrl,
      };
    });

    return { items: sanitizedItems, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateComplaintStatus(
    id: string,
    reviewerId: string,
    status: Status,
    remark?: string,
    assignTo?: string,
  ) {
    const complaint = await this.complaintRepo.findOne({
      where: { id },
      relations: { user: true, assignedTo: true, reviewedBy: true },
    });
    if (!complaint) throw new NotFoundException('অভিযোগ পাওয়া যায়নি');

    const reviewer = await this.userRepo.findOneBy({ id: reviewerId });
    if (!reviewer) throw new NotFoundException('রিভিউয়ার পাওয়া যায়নি');

    if (reviewer.role === Role.OFFICER) {
      const isAssigned = complaint.assignedTo && complaint.assignedTo.id === reviewer.id;
      const isSameDept = reviewer.department && complaint.department === reviewer.department;
      if (!isAssigned && !isSameDept) {
        throw new ForbiddenException(
          'আপনি কেবল আপনার বিভাগের বা আপনার কাছে অ্যাসাইন করা অভিযোগের স্ট্যাটাস পরিবর্তন করতে পারেন',
        );
      }
    }

    complaint.status = status;
    complaint.reviewedBy = reviewer;
    if (remark !== undefined) {
      complaint.adminRemark = remark;
    }

    if (assignTo) {
      const targetOfficer = await this.userRepo.findOneBy({
        id: assignTo,
        role: Role.OFFICER,
      });
      if (!targetOfficer) {
        throw new NotFoundException('অ্যাসাইন করার জন্য অফিসার পাওয়া যায়নি');
      }
      complaint.assignedTo = targetOfficer;
    }

    const saved = await this.complaintRepo.save(complaint);
    return {
      id: saved.id,
      trackingId: saved.trackingId,
      category: saved.category,
      department: saved.department,
      urgency: saved.urgency,
      description: saved.description,
      imageUrl: saved.imagePublicId
        ? this.cloudinaryService.getSignedImageUrl(saved.imagePublicId)
        : saved.imageUrl,
      status: saved.status,
      adminRemark: saved.adminRemark,
      user: saved.user
        ? { id: saved.user.id, name: saved.user.name, phoneNumber: saved.user.phoneNumber }
        : null,
      assignedTo: saved.assignedTo
        ? {
            id: saved.assignedTo.id,
            name: saved.assignedTo.name,
            department: saved.assignedTo.department,
