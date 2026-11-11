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
    description: string,
  ): Promise<{ department: Department; urgency: Urgency; confidence: string } | null> {
    const prompt = `You are a civic routing AI for a Bangladesh Upazila municipality.
Analyze the following citizen complaint and return ONLY a valid JSON object with 'department' and 'urgency'.
Departments allowed: HEALTH, ROAD, ELECTRICITY, WATER, EDUCATION, AGRICULTURE, LAW_ORDER, OTHER.
Urgency allowed: LOW, MEDIUM, HIGH, EMERGENCY.

Complaint Category: "${category}"
Complaint Description: "${description}"

Respond ONLY with valid JSON:
{"department": "ROAD", "urgency": "MEDIUM", "confidence": "high"}`;

    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
