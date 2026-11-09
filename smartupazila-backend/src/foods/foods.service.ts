import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Food } from './food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private repo: Repository<Food>,
  ) {}

  create(dto: CreateFoodDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(category?: string, isAreaSpecial?: boolean, search?: string) {
    return this.repo.find({
      where: {
        ...(category && { category: ILike(`%${category}%`) }),
        ...(isAreaSpecial !== undefined && { isAreaSpecial }),
        ...(search && { name: ILike(`%${search}%`) }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const food = await this.repo.findOneBy({ id });
    if (!food) throw new NotFoundException('খাবারের তথ্য পাওয়া যায়নি');
