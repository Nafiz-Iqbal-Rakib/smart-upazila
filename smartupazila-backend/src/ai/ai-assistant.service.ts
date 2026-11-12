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
