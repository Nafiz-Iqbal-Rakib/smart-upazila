import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmergencyService } from '../emergency/emergency.service';
import { BloodDonorsService } from '../blood-donors/blood-donors.service';
import { FoodsService } from '../foods/foods.service';
import { PlacesService } from '../places/places.service';
import { ComplaintsService } from '../complaints/complaints.service';
import { AdminService } from '../admin/admin.service';
import { Role } from '../users/user.entity';
import { Status } from '../complaints/complaint.entity';
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
      name: 'update_complaint_status',
      description: 'অভিযোগের স্ট্যাটাস পরিবর্তন করার টুল (শুধুমাত্র সংশ্লিষ্ট কর্মকর্তা বা অ্যাডমিন)।',
      allowedRoles: [Role.OFFICER, Role.ADMIN],
      parameters: {
        type: 'OBJECT',
        properties: {
          complaintId: { type: 'STRING', description: 'অভিযোগের UUID' },
          status: { type: 'STRING', description: 'PENDING, IN_PROGRESS, RESOLVED, REJECTED' },
        },
        required: ['complaintId', 'status'],
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
    private adminService: AdminService,
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

