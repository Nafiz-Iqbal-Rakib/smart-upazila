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
    return {
      department: (Department as any)[parsed.department] || Department.OTHER,
      urgency: (Urgency as any)[parsed.urgency] || Urgency.MEDIUM,
      confidence: parsed.confidence || 'ai',
    };
  }

  classifyWithRules(
    category: string,
    description: string,
  ): { department: Department; urgency: Urgency; confidence: string } {
    const text = `${category} ${description}`.toLowerCase();

    // 1. Department keywords
    let department = Department.OTHER;
    if (
      /রাস্তা|সড়ক|সড়কে|কালভার্ট|ব্রিজ|পুল|ভাঙা রাস্তা|গর্ত|রোড|হাইওয়ে|road|pothole|bridge|highway/i.test(
        text,
      )
    ) {
      department = Department.ROAD;
    } else if (
      /বিদ্যুৎ|কারেন্ট|লোডশেডিং|ট্রান্সফরমার|পোস্ট|তার|মিটার|electricity|power|transformer|blackout/i.test(
        text,
      )
    ) {
      department = Department.ELECTRICITY;
    } else if (
      /পানি|সুপেয় পানি|ড্রেন|জলাবদ্ধতা|নর্দমা|পয়ঃনিষ্কাশন|পানির লাইন|কল|টিউবওয়েল|drainage|water|flood|sewage/i.test(
        text,
      )
    ) {
      department = Department.WATER;
    } else if (
      /হাসপাতাল|ডাক্তার|নার্স|ওষুধ|ক্লিনিক|স্বাস্থ্য|অ্যাম্বুলেন্স|রোগী|স্বাস্থ্য কমপ্লেক্স|টিকা|health|hospital|doctor|clinic|medicine/i.test(
        text,
      )
    ) {
      department = Department.HEALTH;
    } else if (
      /স্কুল|কলেজ|মাদ্রাসা|শিক্ষক|ক্লাস|বই|শিক্ষা|উপবৃত্তি|school|college|education|teacher/i.test(
        text,
      )
    ) {
      department = Department.EDUCATION;
    } else if (
      /কৃষি|সার|বীজ|কীটনাশক|ধান|ফসল|সেচ|কৃষক|মাঠ|agriculture|fertilizer|farmer|crop/i.test(
        text,
      )
