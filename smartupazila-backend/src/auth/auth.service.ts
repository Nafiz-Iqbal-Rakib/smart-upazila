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

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const citizen = this.userRepo.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      nid: dto.nid,
      address: dto.address,
      passwordHash,
      role: Role.CITIZEN,
      isApproved: false,
      isActive: true,
    });
    await this.userRepo.save(citizen);

    return {
      message: 'নাগরিক রেজিস্ট্রেশন সফল হয়েছে! উপজেলা অ্যাডমিন অনুমোদন (Approval) দিলে লগইন করতে পারবেন।',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOneBy({ phoneNumber: dto.phoneNumber });
    if (!user) throw new UnauthorizedException('ভুল নম্বর বা password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('ভুল নম্বর বা password');

    if (!user.isApproved) {
      throw new ForbiddenException('আপনার অ্যাকাউন্ট admin approval-এর অপেক্ষায় আছে');
    }

    if (!user.isActive) {
      throw new ForbiddenException('আপনার অ্যাকাউন্ট block করা আছে');
    }

    return {
      accessToken: this.jwt.sign({ sub: user.id, role: user.role }),
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        department: user.department,
      },
    };
  }

  private signToken(userId: string, role: string) {
    return { accessToken: this.jwt.sign({ sub: userId, role }) };
  }
}
