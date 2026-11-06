import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const phoneExists = await this.userRepo.findOneBy({ phoneNumber: dto.phoneNumber });
    if (phoneExists) throw new ConflictException('এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');

    const emailExists = await this.userRepo.findOneBy({ email: dto.email });
    if (emailExists) throw new ConflictException('এই ইমেইলে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');

    const nidExists = await this.userRepo.findOneBy({ nid: dto.nid });
    if (nidExists) throw new ConflictException('এই NID নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট আছে');
