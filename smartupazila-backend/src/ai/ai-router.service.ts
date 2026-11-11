import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Department } from '../users/user.entity';
import { Urgency } from '../complaints/complaint.entity';

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(private configService: ConfigService) {}

  async classifyComplaint(
    category: string,
    description: string,
  ): Promise<{ department: Department; urgency: Urgency; confidence: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (apiKey) {
      try {
        const geminiResult = await this.classifyWithGemini(apiKey, category, description);
        if (geminiResult) return geminiResult;
      } catch (err: any) {
        this.logger.warn(`Gemini classification failed (${err.message}), using rule-based router`);
      }
    }

    return this.classifyWithRules(category, description);
  }

  private async classifyWithGemini(
    apiKey: string,
    category: string,
