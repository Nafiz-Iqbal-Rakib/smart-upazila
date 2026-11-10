import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CommunityListing, ListingType } from './community-listing.entity';
import { CreateCommunityListingDto } from './dto/create-community-listing.dto';
import { UpdateCommunityListingDto } from './dto/update-community-listing.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityListing)
    private repo: Repository<CommunityListing>,
  ) {}

  create(dto: CreateCommunityListingDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(type?: ListingType, address?: string, search?: string) {
    return this.repo.find({
      where: {
        ...(type && { type }),
        ...(address && { address: ILike(`%${address}%`) }),
        ...(search && { name: ILike(`%${search}%`) }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('কমিউনিটি লিস্টিং পাওয়া যায়নি');
    return item;
  }

  async update(id: string, dto: UpdateCommunityListingDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { success: true, message: 'লিস্টিং মুছে ফেলা হয়েছে' };
  }
}

