import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Place, PlaceCategory } from './place.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private repo: Repository<Place>,
  ) {}

  create(dto: CreatePlaceDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(category?: PlaceCategory, address?: string, search?: string) {
    return this.repo.find({
      where: {
        ...(category && { category }),
        ...(address && { address: ILike(`%${address}%`) }),
        ...(search && { name: ILike(`%${search}%`) }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const place = await this.repo.findOneBy({ id });
    if (!place) throw new NotFoundException('দর্শনীয় স্থান পাওয়া যায়নি');
