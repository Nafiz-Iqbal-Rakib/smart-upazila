import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiRouterService } from './ai-router.service';

@Module({
  imports: [ConfigModule],
  providers: [AiRouterService],
  exports: [AiRouterService],
