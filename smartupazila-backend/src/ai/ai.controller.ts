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
