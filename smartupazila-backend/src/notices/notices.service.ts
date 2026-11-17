import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Notice, NoticeCategory, NoticePriority } from './notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private repo: Repository<Notice>,
  ) {}

  async create(adminId: string, dto: CreateNoticeDto) {
    const notice = this.repo.create({
      title: dto.title,
      content: dto.content,
      category: dto.category,
      priority: dto.priority,
      imageUrl: dto.imageUrl,
      pdfUrl: dto.pdfUrl,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      createdBy: { id: adminId },
    });
    return this.repo.save(notice);
  }

  async findAll(
    category?: NoticeCategory,
    priority?: NoticePriority,
    isActive?: boolean,
    search?: string,
  ) {
    return this.repo.find({
      where: {
        ...(category && { category }),
        ...(priority && { priority }),
        ...(isActive !== undefined && { isActive }),
        ...(search && { title: ILike(`%${search}%`) }),
      },
      relations: { createdBy: true },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        priority: true,
        imageUrl: true,
        pdfUrl: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        createdBy: { id: true, name: true, role: true },
      },
      order: {
        priority: 'DESC', // CRITICAL > URGENT > NORMAL
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const notice = await this.repo.findOne({
      where: { id },
      relations: { createdBy: true },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        priority: true,
        imageUrl: true,
        pdfUrl: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: { id: true, name: true, role: true },
      },
    });

    if (!notice) throw new NotFoundException('নোটিশটি পাওয়া যায়নি');
    return notice;
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const notice = await this.findOne(id);
    if (dto.expiresAt) {
      (dto as any).expiresAt = new Date(dto.expiresAt);
    }
    Object.assign(notice, dto);
    return this.repo.save(notice);
  }

  async remove(id: string) {
    const notice = await this.findOne(id);
    await this.repo.remove(notice);
    return { success: true, message: 'নোটিশ সফলভাবে মুছে ফেলা হয়েছে' };
  }
}
