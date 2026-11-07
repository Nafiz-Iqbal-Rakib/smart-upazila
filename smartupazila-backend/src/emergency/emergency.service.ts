import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { EmergencyContact } from './emergency-contact.entity';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(EmergencyContact)
    private repo: Repository<EmergencyContact>,
  ) {}

  create(dto: CreateEmergencyContactDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(category?: string, address?: string) {
    return this.repo.find({
      where: {
        ...(category && { category: ILike(`%${category}%`) }),
        ...(address && { address: ILike(`%${address}%`) }),
      },
      order: { serviceName: 'ASC' },
    });
  }
}

