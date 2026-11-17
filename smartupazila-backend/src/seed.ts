import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department, Role, User } from './users/user.entity';
import { Complaint } from './complaints/complaint.entity';
import { EmergencyContact } from './emergency/emergency-contact.entity';
import { BloodDonor, BloodGroup } from './blood-donors/blood-donor.entity';
import { Food } from './foods/food.entity';
import { Place, PlaceCategory } from './places/place.entity';
import { CommunityListing, ListingType } from './community/community-listing.entity';
import { Notice, NoticeCategory, NoticePriority } from './notices/notice.entity';

const databaseUrl = process.env.DATABASE_URL;
const useSsl =
  process.env.DB_SSL === 'true' ||
  Boolean(
    databaseUrl &&
      (databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')),
  );

const dataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'smartupazila_db',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Complaint,
    EmergencyContact,
    BloodDonor,
    Food,
    Place,
    CommunityListing,
    Notice,
  ],
  synchronize: true,
});

