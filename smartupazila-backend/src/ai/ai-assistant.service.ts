import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmergencyService } from '../emergency/emergency.service';
import { BloodDonorsService } from '../blood-donors/blood-donors.service';
import { FoodsService } from '../foods/foods.service';
import { PlacesService } from '../places/places.service';
import { ComplaintsService } from '../complaints/complaints.service';
import { Role } from '../users/user.entity';
import { BloodGroup } from '../blood-donors/blood-donor.entity';
import { PlaceCategory } from '../places/place.entity';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  allowedRoles: Role[] | 'ALL';
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  // 1. Tool Registry with Security Roles
  private readonly tools: ToolDefinition[] = [
    {
      name: 'get_emergency_contacts',
      description: 'উপজেলার জরুরি সেবাসমূহ (পুলিশ, ফায়ার সার্ভিস, হাসপাতাল, কন্ট্রোল রুম) খোঁজার টুল।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING', description: 'Police, Hospital, Fire, Emergency' },
          address: { type: 'STRING', description: 'উপজেলার এলাকা বা ঠিকানা' },
        },
      },
    },
    {
      name: 'find_blood_donors',
      description: 'উপজেলায় রক্তদাতাদের তালিকা খোঁজার টুল (ব্লাড গ্রুপ ও এলাকা দিয়ে)।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          bloodGroup: {
            type: 'STRING',
            description: 'ব্লাড গ্রুপ যেমন A+, A-, B+, B-, AB+, AB-, O+, O-',
          },
          address: { type: 'STRING', description: 'নির্দিষ্ট এলাকা বা পাড়া' },
        },
      },
    },
    {
      name: 'search_foods',
      description: 'উপজেলার বিখ্যাত খাবার ও রেস্তোরাঁ খোঁজার টুল।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING', description: 'মিষ্টি, ভাতের খাবার, স্ট্রিট ফুড ইত্যাদি' },
          search: { type: 'STRING', description: 'খাবারের নাম যেমন চমচম, খিচুড়ি' },
          isAreaSpecial: { type: 'BOOLEAN', description: 'এলাকার বিশেষ ঐতিহ্যবাহী খাবার কিনা' },
        },
      },
    },
    {
      name: 'search_places',
      description: 'উপজেলার দর্শনীয় স্থান, ঐতিহাসিক প্রাসাদ বা পার্ক খোঁজার টুল।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING', description: 'HISTORICAL, TOURIST_SPOT, PARK, RELIGIOUS' },
          search: { type: 'STRING', description: 'স্থানের নাম' },
        },
      },
    },
    {
      name: 'track_complaint',
      description: 'নাগরিক অভিযোগের Tracking ID দিয়ে বর্তমান অগ্রগতি ও অবস্থা জানার টুল।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          trackingId: { type: 'STRING', description: 'যেমন SUZ-XXXXXX' },
        },
        required: ['trackingId'],
      },
    },
    {
      name: 'submit_complaint',
      description:
        'নাগরিকের কোনো নাগরিক সমস্যা, অবকাঠামোগত সমস্যা বা জরুরি অভিযোগ থাকলে সরাসরি সিস্টেমে অভিযোগ (Complaint) দায়ের করার টুল। যখন নাগরিক সমস্যা জানায় বা অভিযোগ জমা দিতে বলে, তখন এই টুল কল করতে হবে।',
      allowedRoles: 'ALL',
      parameters: {
        type: 'OBJECT',
        properties: {
          description: {
            type: 'STRING',
            description: 'সমস্যার বিস্তারিত বিবরণ',
          },
          category: {
            type: 'STRING',
            description: 'সমস্যার ধরন বা ক্যাটাগরি (ঐচ্ছিক)',
          },
        },
        required: ['description'],
      },
    },
  ];

  constructor(
    private configService: ConfigService,
    private emergencyService: EmergencyService,
    private bloodDonorsService: BloodDonorsService,
    private foodsService: FoodsService,
    private placesService: PlacesService,
    private complaintsService: ComplaintsService,
  ) {}

  // Get tools permitted for current user role
  getPermittedTools(userRole?: Role): ToolDefinition[] {
    return this.tools.filter((tool) => {
      if (tool.allowedRoles === 'ALL') return true;
      if (!userRole) return false;
      return tool.allowedRoles.includes(userRole);
    });
  }

  // Safe Tool Executor
  async executeTool(name: string, args: any, user?: { userId: string; role: Role }) {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) throw new Error(`অজানা টুল: ${name}`);

    // Security Check
    if (tool.allowedRoles !== 'ALL') {
      if (!user || !user.role || !tool.allowedRoles.includes(user.role)) {
        throw new ForbiddenException(`আপনার (${user?.role || 'GUEST'}) এই টুল চালানোর অনুমতি নেই`);
      }
    }

    switch (name) {
      case 'get_emergency_contacts':
        return this.emergencyService.findAll(args?.category, args?.address);

      case 'find_blood_donors': {
        const bg = args?.bloodGroup ? (args.bloodGroup as BloodGroup) : undefined;
        return this.bloodDonorsService.findAll(bg, args?.address);
      }

      case 'search_foods':
        return this.foodsService.findAll(args?.category, args?.isAreaSpecial, args?.search);

      case 'search_places': {
        const cat = args?.category ? (args.category as PlaceCategory) : undefined;
        return this.placesService.findAll(cat, args?.address, args?.search);
      }

      case 'track_complaint':
        return this.complaintsService.findByTrackingId(args?.trackingId, user);

      case 'submit_complaint': {
        if (!user || !user.userId) {
          return {
            status: 'AUTH_REQUIRED',
            message: 'অভিযোগ আনুষ্ঠানিকভাবে সিস্টেমে রেকর্ড করার জন্য অনুগ্রহ করে আগে সিস্টেমে লগইন করুন।',
          };
        }
        const created = await this.complaintsService.create(user.userId, {
          description: args?.description || '',
          category: args?.category,
        });
        return {
          status: 'SUCCESS',
          message: 'আপনার অভিযোগটি সফলভাবে সিস্টেমে রেকর্ড করা হয়েছে ✅',
          trackingId: created.trackingId,
          category: created.category,
          department: created.department,
          urgency: created.urgency,
        };
      }

      default:
        throw new Error(`টুল ইমপ্লিমেন্টেশন পাওয়া যায়নি: ${name}`);
    }
  }

  // Main Chat & Function Calling Entrypoint
  async chat(message: string, user?: { userId: string; role: Role }) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const permittedTools = this.getPermittedTools(user?.role);

    if (apiKey) {
      try {
        return await this.chatWithGemini(apiKey, message, permittedTools, user);
      } catch (err: any) {
        this.logger.warn(`Gemini Function Calling failed (${err.message}), using local tool selector`);
      }
    }

    // Fallback: Local Smart Intent & Tool Selection
    return this.chatWithLocalSelector(message, permittedTools, user);
  }

  private async chatWithGemini(
    apiKey: string,
    message: string,
    tools: ToolDefinition[],
    user?: { userId: string; role: Role },
  ) {
    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: message }] }],
      tools: [{ functionDeclarations }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Gemini call error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0];

    // Check if Gemini invoked a function call
    if (candidate?.functionCall) {
      const call = candidate.functionCall;
      const toolName = call.name;
      const toolArgs = call.args || {};

      const toolResult = await this.executeTool(toolName, toolArgs, user);

      // Return structured response with tool output
      let reply = `এআই সহকারী '${toolName}' টুল এক্সিকিউট করে তথ্য খুঁজে পেয়েছে।`;
      if (toolName === 'submit_complaint') {
        const res = toolResult as any;
        reply =
          res?.status === 'SUCCESS'
            ? `আপনার অভিযোগটি সফলভাবে সিস্টেমে রেকর্ড করা হয়েছে ✅ ট্র্যাকিং আইডি: ${res.trackingId} — বিভাগ: ${res.department} (${res.urgency}) — অ্যাডমিন শীঘ্রই অফিসার নির্ধারণ করবেন।`
            : res?.message || 'অভিযোগ প্রক্রিয়াকরণ সম্পন্ন হয়েছে।';
      }

      return {
        reply,
        toolUsed: toolName,
        toolArgs,
        data: toolResult,
      };
    }

    return {
      reply: candidate?.text || 'আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
      toolUsed: null,
      data: null,
    };
  }

  private async chatWithLocalSelector(
    message: string,
    tools: ToolDefinition[],
    user?: { userId: string; role: Role },
  ) {
    const text = message.toLowerCase();

    // 0. Check for submitting a complaint via chat
    if (
      /অভিযোগ|সমস্যা|নষ্ট|ভেঙে গেছে|পানি জমে|বিদ্যুৎ নাই|ড্রেন|কালভার্ট|complaint|complain|report/i.test(
        text,
      ) &&
      /জমা|করুন|দাও|করব|দায়ের|submit|file|register|লজ/i.test(text) &&
      tools.some((t) => t.name === 'submit_complaint')
    ) {
      if (!user || !user.userId) {
        return {
          reply:
            'অভিযোগ আনুষ্ঠানিকভাবে সিস্টেমে রেকর্ড করার জন্য অনুগ্রহ করে আগে সিস্টেমে লগইন করুন।',
          toolUsed: 'submit_complaint',
          toolArgs: {},
          data: { status: 'AUTH_REQUIRED' },
        };
      }
      const result: any = await this.executeTool(
        'submit_complaint',
        { description: message },
        user,
      );
      return {
        reply: `আপনার অভিযোগটি সফলভাবে সিস্টেমে রেকর্ড করা হয়েছে ✅ ট্র্যাকিং আইডি: ${result.trackingId} — বিভাগ: ${result.department} (${result.urgency}) — অ্যাডমিন শীঘ্রই অফিসার নির্ধারণ করবেন।`,
        toolUsed: 'submit_complaint',
        toolArgs: { description: message },
        data: result,
      };
    }

    // 1. Check for tracking ID
    const trackingMatch = message.match(/SUZ-[A-Z0-9]{6}/i);
    if (trackingMatch && tools.some((t) => t.name === 'track_complaint')) {
      const trackingId = trackingMatch[0].toUpperCase();
      try {
        const complaint = (await this.executeTool('track_complaint', { trackingId }, user)) as any;
        return {
          reply: `অভিযোগ আইডি ${trackingId}-এর বর্তমান অবস্থা: ${complaint.status} (বিভাগ: ${complaint.department || 'OTHER'}, জরুরি অবস্থা: ${complaint.urgency || 'MEDIUM'})`,
          toolUsed: 'track_complaint',
          toolArgs: { trackingId },
          data: complaint,
        };
      } catch {
        return {
          reply: `অভিযোগ আইডি ${trackingId} খুঁজে পাওয়া যায়নি।`,
          toolUsed: 'track_complaint',
          toolArgs: { trackingId },
          data: null,
        };
      }
    }

    // 2. Check for blood donors (check before emergency since users often say "জরুরি রক্ত")
    if (
      /রক্ত|ব্লাড|donor|blood/i.test(text) &&
      tools.some((t) => t.name === 'find_blood_donors')
    ) {
      const bgMatch = message.match(/(A|B|AB|O)[+-]/i);
      const bloodGroup = bgMatch ? bgMatch[0].toUpperCase() : undefined;
      const result = await this.executeTool('find_blood_donors', { bloodGroup }, user);
      return {
        reply: bloodGroup
          ? `${bloodGroup} গ্রুপের উপলব্ধ রক্তদাতাদের তালিকা:`
          : 'উপলব্ধ রক্তদাতাদের তালিকা নিচে দেওয়া হলো:',
        toolUsed: 'find_blood_donors',
        toolArgs: { bloodGroup },
        data: result,
      };
    }

    // 3. Check for emergency contacts
    if (
      /পুলিশ|থানা|ফায়ার|হাসপাতাল|অ্যাম্বুলেন্স|কন্ট্রোল রুম|জরুরি সেবা|জরুরি যোগাযোগ|emergency|police|hospital|fire/i.test(
        text,
      ) &&
      tools.some((t) => t.name === 'get_emergency_contacts')
    ) {
      let category: string | undefined;
      if (/পুলিশ|থানা/i.test(text)) category = 'Police';
      else if (/হাসপাতাল|অ্যাম্বুলেন্স/i.test(text)) category = 'Hospital';
      else if (/ফায়ার/i.test(text)) category = 'Fire';

      const result = await this.executeTool('get_emergency_contacts', { category }, user);
      return {
        reply: 'উপজেলার জরুরি যোগাযোগ নম্বরসমূহ নিচে দেওয়া হলো:',
        toolUsed: 'get_emergency_contacts',
        toolArgs: { category },
        data: result,
      };
    }

    // 4. Check for local foods
    if (
      /খাবার|মিষ্টি|চমচম|খিচুড়ি|রেস্তোরাঁ|food/i.test(text) &&
      tools.some((t) => t.name === 'search_foods')
    ) {
      const result = await this.executeTool('search_foods', {}, user);
      return {
        reply: 'উপজেলার বিখ্যাত খাবার ও রেস্তোরাঁর তথ্য:',
        toolUsed: 'search_foods',
        toolArgs: {},
        data: result,
      };
    }

    // 5. Check for places
    if (
      /জমিদার|স্থান|দর্শনীয়|পার্ক|ঘুরতে|মসজিদ|place|tourist/i.test(text) &&
      tools.some((t) => t.name === 'search_places')
    ) {
      const result = await this.executeTool('search_places', {}, user);
      return {
        reply: 'উপজেলার দর্শনীয় ও ঐতিহাসিক স্থানসমূহের তথ্য:',
        toolUsed: 'search_places',
        toolArgs: {},
        data: result,
      };
    }

    return {
      reply: 'স্বাগতম! আপনি উপজেলার জরুরি সেবা, রক্তদাতা, খাবার, দর্শনীয় স্থান বা নাগরিক অভিযোগ ট্র্যাক করতে পারেন।',
      toolUsed: null,
      data: null,
    };
  }
}
