import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BloodDonor, BloodGroup } from './blood-donor.entity';
import { CreateBloodDonorDto } from './dto/create-blood-donor.dto';

@Injectable()
export class BloodDonorsService {
  constructor(
    @InjectRepository(BloodDonor)
    private repo: Repository<BloodDonor>,
  ) {}

  async create(dto: CreateBloodDonorDto) {
    const existing = await this.repo.findOneBy({ phoneNumber: dto.phoneNumber });
    if (existing) {
      throw new ConflictException('এই ফোন নম্বরে একজন ডোনার ইতোমধ্যে নিবন্ধিত আছেন');
    }
    return this.repo.save(this.repo.create(dto));
  }

  findAll(bloodGroup?: BloodGroup, address?: string) {
    return this.repo.find({
      where: {
        isAvailable: true,
        ...(bloodGroup && { bloodGroup }),
        ...(address && { address: ILike(`%${address}%`) }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const donor = await this.repo.findOneBy({ id });
