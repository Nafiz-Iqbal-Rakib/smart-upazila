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
