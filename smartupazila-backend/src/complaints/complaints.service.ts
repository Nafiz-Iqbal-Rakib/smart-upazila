import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Role } from '../users/user.entity';
import { AiRouterService } from '../ai/ai-router.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private repo: Repository<Complaint>,
    private aiRouter: AiRouterService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(userId: string, dto: CreateComplaintDto, imagePublicId?: string) {
    const trackingId = this.generateTrackingId();


    const classification = await this.aiRouter.classifyComplaint(dto.description, dto.category);

    const complaint = this.repo.create({
      category: dto.category || classification.category,
      description: dto.description,
      imageUrl: imagePublicId ? null : dto.imageUrl || null,
      imagePublicId: imagePublicId || null,
      trackingId,
      department: classification.department,
      urgency: classification.urgency,
      assignedTo: null,
      user: { id: userId },
    });

    const saved = await this.repo.save(complaint);

    return {
      message: 'অভিযোগ জমা হয়েছে ',
      trackingId: saved.trackingId,
      status: saved.status,
      category: saved.category,
      department: saved.department,
      urgency: saved.urgency,
      assignedOfficer: null,
    };
  }

  async findMyComplaints(userId: string) {
    const complaints = await this.repo.find({
      where: { user: { id: userId } },
      relations: { assignedTo: true, reviewedBy: true },
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
        assignedTo: { id: true, name: true, department: true },
        reviewedBy: { id: true, name: true, role: true },
      },
      order: { createdAt: 'DESC' },
    });

    return complaints.map((c) => this.withResolvedImageUrl(c, true));
  }

  async findByTrackingId(
    trackingId: string,
    requestingUser?: { userId: string; role: Role },
  ) {
    const complaint = await this.repo.findOne({
      where: { trackingId },
      relations: { user: true, assignedTo: true, reviewedBy: true },
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
        user: { id: true, name: true },
        assignedTo: { id: true, name: true, department: true },
        reviewedBy: { id: true, name: true, role: true },
      },
    });
    if (!complaint) throw new NotFoundException('এই Tracking ID-এ কোনো অভিযোগ পাওয়া যায়নি');

    const canViewPrivateImage = Boolean(
      requestingUser &&
      (requestingUser.role === Role.ADMIN ||
        requestingUser.userId === complaint.user?.id ||
        requestingUser.userId === complaint.assignedTo?.id),
    );

    return this.withResolvedImageUrl(complaint, canViewPrivateImage);
  }

  private withResolvedImageUrl(complaint: Complaint, canViewPrivateImage: boolean) {
    const { imagePublicId, ...rest } = complaint;
    if (imagePublicId) {
      return {
        ...rest,
        imageUrl: canViewPrivateImage
          ? this.cloudinaryService.getSignedImageUrl(imagePublicId)
          : null,
      };
    }
    return {
      ...rest,
      imageUrl: canViewPrivateImage ? rest.imageUrl : null,
    };
  }


  private generateTrackingId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SUZ-${code}`;
  }
}
