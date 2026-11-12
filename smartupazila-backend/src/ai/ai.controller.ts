import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAssistantService } from './ai-assistant.service';
import { AssistantChatDto } from './dto/assistant-chat.dto';
import { Role, User } from '../users/user.entity';

@ApiTags('assistant')
@Controller('assistant')
export class AiController {
  constructor(
    private assistantService: AiAssistantService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  @Post('chat')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'AI Assistant (Function Calling / Tool Use) - Role Aware',
    description:
      'নাগরিক ও কর্মকর্তাদের জন্য এআই সহকারী। স্বয়ংক্রিয়ভাবে প্রাসঙ্গিক টুল (ব্লাড ডোনার, ইমার্জেন্সি, কমপ্লেইন্ট ট্র্যাকিং ইত্যাদি) নির্ধারণ করে উত্তর দেয়।',
  })
  async chat(@Body() dto: AssistantChatDto, @Req() req: any) {
    let user: { userId: string; role: Role } | undefined = undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const secret = this.configService.get<string>('JWT_SECRET');
        const payload = this.jwtService.verify(token, { secret });
        if (payload?.sub) {
          const dbUser = await this.userRepo.findOneBy({ id: payload.sub });
          if (dbUser && dbUser.isApproved && dbUser.isActive) {
            user = { userId: dbUser.id, role: dbUser.role };
          }
        }
      } catch {
        // Guest user if token invalid
      }
    }

    return this.assistantService.chat(dto.message, user);
  }
}

