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
