import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Department } from '../users/user.entity';
import { Urgency } from '../complaints/complaint.entity';

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(private configService: ConfigService) {}

  async classifyComplaint(
    description: string,
    category?: string,
  ): Promise<{ category: string; department: Department; urgency: Urgency; confidence: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (apiKey) {
      try {
        const geminiResult = await this.classifyWithGemini(apiKey, description, category);
        if (geminiResult) return geminiResult;
      } catch (err: any) {
        this.logger.warn(`Gemini classification failed (${err.message}), using rule-based router`);
      }
    }

    return this.classifyWithRules(description, category);
  }

  private async classifyWithGemini(
    apiKey: string,
    description: string,
    category?: string,
  ): Promise<{ category: string; department: Department; urgency: Urgency; confidence: string } | null> {
    const prompt = `You are an intelligent civic routing and triage AI for a Bangladesh Upazila municipality.
Citizens report municipal, infrastructure, or emergency problems in Bengali or English.
Citizens often do NOT know which official department or category their problem belongs to—they simply describe the issue.

Task:
Analyze the citizen's complaint and return ONLY a valid JSON object with:
1. "category": A concise, natural Bengali category title (2 to 4 words, e.g. "সড়ক ও কালভার্ট সমস্যা", "বিদ্যুৎ বিভ্রাট ও সংযোগ", "সুপেয় পানি ও ড্রেনেজ", "স্বাস্থ্য ও হাসপাতাল সেবা", "শিক্ষা ও স্কুল সমস্যা", "কৃষি ও সেচ সেবা", "আইনশৃঙ্খলা ও নিরাপত্তা", "সাধারণ নাগরিক সমস্যা").
2. "department": Exactly one of: HEALTH, ROAD, ELECTRICITY, WATER, EDUCATION, AGRICULTURE, LAW_ORDER, OTHER.
3. "urgency": Exactly one of: LOW, MEDIUM, HIGH, EMERGENCY (EMERGENCY if live wires, collapsed bridge/building, fire hazard, or immediate danger to human life).
4. "confidence": "high", "medium", or "low".

${category ? `Citizen Suggested Topic: "${category}"\n` : ''}Complaint Description: "${description}"

Respond ONLY with valid JSON in this exact structure:
{"category": "সড়ক ও কালভার্ট সমস্যা", "department": "ROAD", "urgency": "HIGH", "confidence": "high"}`;

    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
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
      category: parsed.category || category || 'সাধারণ নাগরিক সমস্যা',
      department: (Department as any)[parsed.department] || Department.OTHER,
      urgency: (Urgency as any)[parsed.urgency] || Urgency.MEDIUM,
      confidence: parsed.confidence || 'ai',
    };
  }

  classifyWithRules(
    description: string,
    category?: string,
  ): { category: string; department: Department; urgency: Urgency; confidence: string } {
    const text = `${category || ''} ${description}`.toLowerCase();

    // 1. Department keywords & auto-category
    let department = Department.OTHER;
    let autoCategory = category?.trim() || 'সাধারণ নাগরিক সমস্যা';

    if (
      /রাস্তা|সড়ক|সড়কে|কালভার্ট|ব্রিজ|পুল|ভাঙা রাস্তা|গর্ত|রোড|হাইওয়ে|road|pothole|bridge|highway/i.test(
        text,
      )
    ) {
      department = Department.ROAD;
      if (!category) autoCategory = 'সড়ক ও যোগাযোগ ব্যবস্থা';
    } else if (
      /বিদ্যুৎ|কারেন্ট|লোডশেডিং|ট্রান্সফরমার|পোস্ট|তার|মিটার|electricity|power|transformer|blackout/i.test(
        text,
      )
    ) {
      department = Department.ELECTRICITY;
      if (!category) autoCategory = 'বিদ্যুৎ সেবা ও বিভ্রাট';
    } else if (
      /পানি|সুপেয় পানি|ড্রেন|জলাবদ্ধতা|নর্দমা|পয়ঃনিষ্কাশন|পানির লাইন|কল|টিউবওয়েল|drainage|water|flood|sewage/i.test(
        text,
      )
    ) {
      department = Department.WATER;
      if (!category) autoCategory = 'পানি ও নিষ্কাশন ব্যবস্থা';
    } else if (
      /হাসপাতাল|ডাক্তার|নার্স|ওষুধ|ক্লিনিক|স্বাস্থ্য|অ্যাম্বুলেন্স|রোগী|স্বাস্থ্য কমপ্লেক্স|টিকা|health|hospital|doctor|clinic|medicine/i.test(
        text,
      )
    ) {
      department = Department.HEALTH;
      if (!category) autoCategory = 'স্বাস্থ্য ও চিকিৎসা সেবা';
    } else if (
      /স্কুল|কলেজ|মাদ্রাসা|শিক্ষক|ক্লাস|বই|শিক্ষা|উপবৃত্তি|school|college|education|teacher/i.test(
        text,
      )
    ) {
      department = Department.EDUCATION;
      if (!category) autoCategory = 'শিক্ষা ও শিক্ষা প্রতিষ্ঠান';
    } else if (
      /কৃষি|সার|বীজ|কীটনাশক|ধান|ফসল|সেচ|কৃষক|মাঠ|agriculture|fertilizer|farmer|crop/i.test(
        text,
      )
    ) {
      department = Department.AGRICULTURE;
      if (!category) autoCategory = 'কৃষি ও কৃষক সেবা';
    } else if (
      /পুলিশ|চুরি|ছিনতাই|ডাকাতি|মারামারি|ইভটিজিং|মাদক|জুয়া|নিরাপত্তা|crime|police|security|theft/i.test(
        text,
      )
    ) {
      department = Department.LAW_ORDER;
      if (!category) autoCategory = 'আইনশৃঙ্খলা ও জননিরাপত্তা';
    }

    // 2. Urgency keywords
    let urgency = Urgency.MEDIUM;
    if (
      /জরুরি|বিপদজনক|জীবননাশের|আগুন|দুর্ঘটনা|মারাত্মক|ধ্বসে|ভেঙে পড়ছে|ঝুঁকিপূর্ণ|death|danger|hazard|urgent|emergency/i.test(
        text,
      )
    ) {
      urgency = Urgency.EMERGENCY;
    } else if (
      /অনেক দিন ধরে|গুরুতর|বন্ধ হয়ে আছে|চরম দুর্ভোগ|অসহ্য|severe|critical/i.test(
        text,
      )
    ) {
      urgency = Urgency.HIGH;
    } else if (/সাধারণ|পরামর্শ|তথ্য|minor|info/i.test(text)) {
      urgency = Urgency.LOW;
    }

    return { category: autoCategory, department, urgency, confidence: 'rule-based' };
  }
}

