import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Complaint, Status } from './complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Role, User } from '../users/user.entity';
import { AiRouterService } from '../ai/ai-router.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private repo: Repository<Complaint>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private aiRouter: AiRouterService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, dto: CreateComplaintDto, imagePublicId?: string) {
    const trackingId = this.generateTrackingId();

    // 1. AI Classification of Department & Urgency
    const classification = await this.aiRouter.classifyComplaint(dto.category, dto.description);

    // 2. Department officer assignment (least workload)
    let assignedOfficer: User | null = null;
    const officers = await this.userRepo.find({
      where: {
        role: Role.OFFICER,
        department: classification.department,
        isActive: true,
        isApproved: true,
      },
    });

    if (officers.length > 0) {
      let minWorkload = Infinity;
      for (const officer of officers) {
        const count = await this.repo.count({
          where: {
            assignedTo: { id: officer.id },
            status: In([Status.PENDING, Status.IN_PROGRESS]),
          },
        });
        if (count < minWorkload) {
          minWorkload = count;
          assignedOfficer = officer;
        }
      }
    }

    const complaint = this.repo.create({
      category: dto.category,
      description: dto.description,
      imageUrl: imagePublicId ? null : dto.imageUrl || null,
      imagePublicId: imagePublicId || null,
      trackingId,
      department: classification.department,
      urgency: classification.urgency,
      assignedTo: assignedOfficer,
      user: { id: userId },
    });

    const saved = await this.repo.save(complaint);

    return {
      message: 'অভিযোগ জমা হয়েছে ✅',
      trackingId: saved.trackingId,
      status: saved.status,
      department: saved.department,
      urgency: saved.urgency,
      assignedOfficer: assignedOfficer
        ? `${assignedOfficer.name} (${saved.department} বিভাগ)`
        : 'অপেক্ষারত (অ্যাডমিন পর্যালোচনা)',
    };
  }

  async findMyComplaints(userId: string) {
    const complaints = await this.repo.find({
      where: { user: { id: userId } },
      relations: { assignedTo: true, reviewedBy: true },
      select: {
